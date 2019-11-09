import numpy as np
from flask import Flask, abort, jsonify, request
import pickle as pickle
import pandas as pd
import matplotlib.pyplot as plt
import processing
from processing import *
import joblib
import json
import base64
from datetime import date
from time import gmtime, strftime
import base64
import os

app = Flask(__name__)

@app.route('/')
def index():
  return '<h1>Instrucciones:</h1>'
@app.route('/api/<model>', methods=['POST'])
def make_predict(model):
    data=request.get_json(force=True)
    datat = data['espetro']
    datat = np.asarray(datat)
    #.transpose() ???
    print (datat.shape)
    output = []
    if (model == "default"):
        output = processing.predictDefault(datat)
    else:
        model_file = base64.b64decode(data['model'])
        scaler_file = base64.b64decode(data['scaler'])
        model_path = "models/temp_model.pkl"
        scaler_path = "scaler/temp_scaler.pkl"
        with open( model_path, 'wb') as f:
            f.write(model_file)
        f.close()
        with open ( scaler_path, 'wb') as g:
            g.write(scaler_file)
        g.close()

        models = open(model_path, "rb")
        scalers = open(scaler_path, "rb")
        scaler = joblib.load(scalers)
        clf = joblib.load(models)
        escalado = None
        if ( data['scaler_type'] == "standard"):
            escalado = StandardScaler().fit(datat).transform(datat)
        elif ( data['scaler_type'] == "minmax" ):
            escalado = MinMaxScaler().fit(datat).transform(datat)
        print (data['scaler_type'])
        proc_data = escalado
        if ( data['transform_type'] == "fft" ):
            proc_data = np.fft.fft(escalado)
        elif ( data['transform_type'] == "dct" ):
            proc_data =  dct(escalado)
        elif ( data['transform_type'] == "dwt" ):
            proc_data, data_d = pywt.dwt(escalado, 'db1')

        derivable = proc_data
        if ( data['derivable'] == "True" ):
            d1 = np.diff(derivable)
            d2 = np.diff(derivable, n=2)
            derivable = np.concatenate((derivable, d1), axis = 1)
            derivable = np.concatenate((derivable, d2), axis = 1)

        predict_request = derivable

        predict_request = np.asarray(predict_request)
        y_hat = clf.predict(predict_request.real)
        escaladon = scaler.inverse_transform(y_hat)
        output = escaladon
        output = output.tolist()
        models.close()
        scalers.close()
        try:
            os.remove(model_path)
            os.remove(scaler_path)
        except OSError as e: # name the Exception `e`
            print ("Failed with:", e.strerror) # look what it says
            #print ("Error code:", e.code)

    return json.dumps(output)

@app.route('/api/train/<model>/<scaler>/<preprocessing>/<derivable>', methods=['POST'])
def train_model(model, scaler, preprocessing, derivable):
    request_content = request.get_json(force=True)
    data = request_content['espetro']
    labels = request_content['labels']
    data = np.asarray(data)
    labels = np.asarray(labels)
    print(data)
    print(labels)
    transformed_data, transformed_labels, label_scaler = processing.transform_data(data, labels, scaler, preprocessing, derivable)
    train_model = None
    if (model == "linear"):
        train_model = LinearRegression()
    elif(model == "svr"):
        train_model = SVR( kernel='linear' )
    elif(model == "mlp"):
        train_model = MLPRegressor(hidden_layer_sizes=(10), max_iter=1000, alpha=0.0001,
                     solver='adam', verbose=10,  random_state=42,tol=0.000000001)
    else:
        print("ERROR!")
    if (train_model != None):
        is_std = 0

        if (scaler == "standard"):
            is_std = 1

        trained_model, mse, r2, cvs = processing.train_nmodel(data, labels, train_model, is_std)
        today = strftime("%B-%d-%Y,%H:%M", gmtime())

        file_name = scaler + "_mor_" + today + "_"
        model_path = 'models/' + file_name + '.pkl'
        scaler_path = 'scaler/' + scaler + "_" + today + '.pkl'
        with open( model_path, 'wb') as f:
            pickle.dump(trained_model, f)
        with open( scaler_path, 'wb') as g:
            pickle.dump(label_scaler, g)

        model_file = open( model_path, 'rb')
        scaler_file = open( scaler_path, 'rb')
        answer = {
            "file_name" : file_name,
            "mse" : mse,
            "r2" : r2,
            "cross_val_score" : cvs.tolist(),
            "model": str(base64.b64encode(model_file.read()), "utf-8"),
            "scaler": str(base64.b64encode(scaler_file.read()), "utf-8"),
            "derivable": derivable
        }
        model_file.close()
        scaler_file.close()
        try:
            os.remove(model_path)
            os.remove(scaler_path)
        except OSError as e: # name the Exception `e`
            print ("Failed with:", e.strerror) # look what it says
            #print ("Error code:", e.code)
    else:
        answer = {
            "Error": "Modelo no encontrado."
        }
    return json.dumps(answer)
@app.route('/api/graphs', methods=['POST'])
def distribution_graphs():
    request_content = request.get_json(force=True)
    data = request_content['caracteristicas']
    elementos = request_content['elementos']
    tipo = request_content['tipo']
    dataframe = pd.DataFrame(data)
    dataframe = dataframe.transpose()
    dataframe.columns = elementos
    print( dataframe.shape, " --- ", len(elementos)  )
    if ( tipo == "hist" ):
        dataframe.hist(bins = 50, figsize=(20,15))
    else:
        plt.boxplot(dataframe.transpose(), labels = elementos , notch=True)
        plt.xticks(rotation=45)

    image_path = 'images/distribution.png'
    plt.savefig(image_path)
    image_file = open( image_path, 'rb')
    answer = {
        "image": str(base64.b64encode(image_file.read()), 'utf-8')
        #"image": image_file.encode('base64')
    }
    image_file.close()
    try:
        os.remove(image_path)
    except OSError as e: # name the Exception `e`
        print ("Failed with:", e.strerror) # look what it says
        #print ("Error code:", e.code)
    return json.dumps(answer)
