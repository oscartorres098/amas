from flask import request
from flask import Flask

app = Flask(__name__)

@app.route ('/peticion', methods=['GET', 'POST'])
def peticion():
  if request.method == 'GET':
    return "{\"state\" : \"GET\"}"
  else:
    return "{\"state\" : \"POST\"}"
