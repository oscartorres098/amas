import numpy as np
from flask import Flask, abort, jsonify, request
import pickle as pickle
import processing
from processing import *
import joblib
import json
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
    print (datat)
    print (datat.shape)
    output = []
    if (model == "default"):
        output = processing.predictDefault(datat)
    else:
        model = "models/" + model
        models = open(model, "rb")
        scaler = joblib.load("scaler/scaler.save")
        clf = joblib.load(models)

        escalado = StandardScaler().fit(datat).transform(datat)
        fft_data = np.fft.fft(escalado)
        predict_request =fft_data
        print (predict_request.real)
        predict_request = np.asarray(predict_request).transpose()
        y_hat = clf.predict(predict_request.real)
        print (y_hat)
        escaladon = scaler.inverse_transform(y_hat)
        print (escaladon)
        output = escaladon
        output = output.tolist()

    return json.dumps(output)

@app.route('/api/train/<model>/<scaler>/<preprocessing>', methods=['POST'])
def train_model(model, scaler, preprocessing):
    request_content = request.get_json(force=True)
    data = request_content['espetro']
    labels = request_content['labels']
    data = np.asarray(data)
    labels = np.asarray(labels)
    print(data)
    print(labels)
    transformed_data, transformed_labels = processing.transform_data(data, labels, scaler, preprocessing)
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
        path = 'models/' + file_name + '.pkl'
        with open( path, 'wb') as f:
            pickle.dump(trained_model, f)
        file = open( path, 'rb')
        answer = {
            "file_name" : file_name,
            "mse" : mse,
            "r2" : r2,
            "cross_val_score" : cvs.tolist(),
            "model": str(base64.b64encode(file.read()), "utf-8")
        }
        file.close()
        try:
            os.remove(path)
        except OSError as e: # name the Exception `e`
            print ("Failed with:", e.strerror) # look what it says
            print ("Error code:", e.code)
    else:
        answer = {
            "Error": "Modelo no encontrado."
        }
    return json.dumps(answer)
