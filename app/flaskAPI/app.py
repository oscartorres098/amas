import numpy as np
from flask import Flask, abort, jsonify, request
import pickle as pickle
from sklearn.externals import joblib
import json

app = Flask(__name__)

@app.route('/')
def index():
  return '<h1>Instrucciones:</h1>'
@app.route('/api/<model>', methods=['POST'])
def make_predict(model):
  model = "models/" + model
  ph_predictor = open(model, "rb")
  clf = joblib.load(ph_predictor)
  data=request.get_json(force=True)
  predict_request =[data['espetro']]
  predict_request = np.asarray(predict_request)
  y_hat = clf.predict(predict_request)
  output = [y_hat[0]]
  b = output[0].tolist()
  return json.dumps(b)
