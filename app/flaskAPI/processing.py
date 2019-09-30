import numpy as np
import pywt
from sklearn.preprocessing import StandardScaler
from sklearn.preprocessing import MinMaxScaler
from sklearn.multioutput import MultiOutputRegressor
from sklearn.linear_model import LinearRegression
from sklearn.neural_network import MLPRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
from sklearn.metrics import r2_score
from sklearn.model_selection import cross_val_score
from sklearn.svm import SVR
from scipy.fftpack import dct
import joblib

def transform_data(data, labels, scaler, preprocessing):
    if (scaler == "minmax"):
        data = MinMaxScaler().fit(data).transform(data)
        labels = MinMaxScaler().fit(labels).transform(labels)
    elif (scaler == "standard"):
        data = StandardScaler().fit(data).transform(data)
        labels = StandardScaler().fit(labels).transform(labels)

    if (preprocessing == "fft"):
        data = np.fft.fft(data)
    elif (preprocessing == "dct"):
        data = dct(data)
    elif (preprocessing == "dwt"):
        data, data_d = pywt.dwt(data, 'db1')

    return data, labels

def train_nmodel(data, labels):
    x_train, x_test, y_train, y_test = train_test_split( data, labels, test_size = 0.25, random_state = 42 )
    mor = MultiOutputRegressor( LinearRegression() )
    mor.fit(x_train, y_train)
    y_pred = mor.predict(x_test)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    cvs = cross_val_score(mor, data, labels, cv=3, scoring='neg_mean_squared_error')
    print (y_pred)
    print (x_train)
    return mor, mse, r2, cvs

def predictDefault(data):
    mm_data = MinMaxScaler().fit(data).transform(data)
    std_data = StandardScaler().fit(data).transform(data)

    mm_data_d1 = np.diff(mm_data)
    std_data_d1 = np.diff(std_data)
    mm_data_d2 = np.diff(mm_data, n=2)
    std_data_d2 = np.diff(std_data, n=2)

    mm_all_data = np.concatenate((std_data, mm_data_d1), axis = 1)
    mm_all_data = np.concatenate((mm_all_data, mm_data_d2), axis = 1)
    std_all_data = np.concatenate((std_data, std_data_d1), axis = 1)
    std_all_data = np.concatenate((std_all_data, std_data_d2), axis = 1)

    mm_fft_data = np.fft.fft(mm_all_data)
    sd_fft_data = np.fft.fft(std_all_data)
    sd_dwt_data, data_d = pywt.dwt(std_all_data, 'db1')

    arcilla = joblib.load("models/Arcilla.pkl")
    arena = joblib.load("models/ArenaModel.pkl")
    mo = joblib.load("models/MOModel.pkl")
    co = joblib.load("models/COModel.pkl")
    ca = joblib.load("models/CaModel.pkl")
    ph = joblib.load("models/pHModel.pkl")
    dr = joblib.load("models/DrModel.pkl")
    hg = joblib.load("models/HGModel.pkl")

    mo_res = mo.predict(mm_fft_data.real)
    co_res = co.predict(mm_fft_data.real)
    arena_res = arena.predict(sd_dwt_data)
    arcilla_res = arcilla.predict(sd_fft_data.real)
    hg_res = hg.predict(mm_fft_data.real)
    dr_res = dr.predict(mm_fft_data.real)
    ph_res = ph.predict(sd_dwt_data)
    ca_res = ca.predict(sd_fft_data.real)

    output = np.concatenate((mo_res, co_res, arena_res, arcilla_res, hg_res, dr_res, ph_res, ca_res))
    output = output.transpose()
    return output
