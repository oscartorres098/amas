import numpy as np
from flask import Flask, abort, jsonify, request
import pickle as pickle
import joblib
from sklearn.preprocessing import StandardScaler
from sklearn.multioutput import MultiOutputRegressor
from sklearn.linear_model import LinearRegression
import json

app = Flask(__name__)

@app.route('/')
def index():
  return '<h1>Instrucciones:</h1>'
@app.route('/api/<model>', methods=['POST'])
def make_predict(model):
  model = "models/" + model
  models = open(model, "rb")
  scaler = joblib.load("models/scaler.save")
  clf = joblib.load(models)
  data=request.get_json(force=True)
  datat = [data['espetro']]
  escalado = StandardScaler().fit(datat).transform(datat)
  fft_data = np.fft.fft(escalado)
  predict_request =fft_data
  y_hat = clf.predict(predict_request.real)
  escaladon = scaler.inverse_transform(y_hat)
  output = escaladon
  b = output[0].tolist()
  return json.dumps(b)
