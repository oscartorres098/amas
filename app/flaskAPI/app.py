import numpy as np
from flask import Flask, abort, jsonify, request
import pickle as pickle
import processing
import json
from datetime import date

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

    b = output.tolist()
    return json.dumps(b)

@app.route('/api/train/<model>/<scaler>/<preprocessing>', methods=['POST'])
def train_model(model, scaler, preprocessing):
    #models = open(model,"rb")
    request_content = request.get_json(force=True)
    data = request_content['espetro']
    labels = request_content['labels']
    data = np.asarray(data)
    labels = np.asarray(labels)
    print(data)
    print(labels)
    transformed_data, transformed_labels = processing.transform_data(data, labels, scaler, preprocessing)
    trained_model, mse, r2, cvs = processing.train_nmodel(data, labels)
    today = date.today().strftime("%B-%d-%Y,%H:%M")

    file_name = scaler + "mor_" + today
    with open('models/' + file_name + '.pkl', 'wb') as f:
        pickle.dump(trained_model, f)

    answer = {
        "file_name" : file_name,
        "mse" : mse,
        "r2" : r2,
        "cross_val_score" : cvs.tolist()
    }

    return json.dumps(answer)
