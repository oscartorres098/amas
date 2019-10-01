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

    mm_scaler = joblib.load("scaler/MinMaxScaler.save")
    sd_scaler = joblib.load("scaler/scaler.save")

    mo_scaler = co_scaler = hg_scaler = dr_scaler = MinMaxScaler()
    arena_scaler = arcilla_scaler = ph_scaler = ca_scaler = StandardScaler()

    mo_scaler.min_, mo_scaler.scale = mm_scaler.min_[0], mm_scaler.scale_[0]
    co_scaler.min_, co_scaler.scale = mm_scaler.min_[1], mm_scaler.scale_[1]
    hg_scaler.min_, hg_scaler.scale = mm_scaler.min_[5], mm_scaler.scale_[5]
    dr_scaler.min_, dr_scaler.scale = mm_scaler.min_[6], mm_scaler.scale_[6]
    arena_scaler.mean_, arena_scaler.var_ , arena_scaler.scale_ = sd_scaler.mean_[2], sd_scaler.var_[2], sd_scaler.scale_[2]
    arcilla_scaler.mean_, arcilla_scaler.var_ , arcilla_scaler.scale_ = sd_scaler.mean_[3], sd_scaler.var_, sd_scaler.scale_[3]
    ph_scaler.mean_, ph_scaler.var_ , ph_scaler.scale_ = sd_scaler.mean_[7], sd_scaler.var_[7], sd_scaler.scale_[7]
    ca_scaler.mean_, ca_scaler.var_ , ca_scaler.scale_ = sd_scaler.mean_[8], sd_scaler.var_[8], sd_scaler.scale_[8]

    print ("------------------------")
    print (mo_res.shape)
    print ("------------------------")
    mo_res = mo_scaler.inverse_transform([mo_res])
    co_res = co_scaler.inverse_transform([co_res])
    arena_res = arena_scaler.inverse_transform([arena_res])
    arcilla_res = arcilla_scaler.inverse_transform([arcilla_res])
    hg_res = hg_scaler.inverse_transform([hg_res])
    dr_res = dr_scaler.inverse_transform([dr_res])
    ph_res = ph_scaler.inverse_transform([ph_res])
    ca_res = ca_scaler.inverse_transform([ca_res])

    output = []

    print("----------------------------")
    print(len(data))
    print("----------------------------")

    for i in range (len(data)):
        row = []
        row.append(mo_res[i])
        row.append(co_res[i])
        row.append(arena_res[i])
        row.append(arcilla_res[i])
        row.append(hg_res[i])
        row.append(dr_res[i])
        row.append(ph_res[i])
        row.append(ca_res[i])
        output.append(row)
    #output = np.concatenate((mo_res, co_res, arena_res, arcilla_res, hg_res, dr_res, ph_res, ca_res))
    #output = output.transpose()

    return output
