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
    cvs = cross_val_score(mor, data, labels, cv=4, scoring='neg_mean_squared_error')
    print (y_pred)
    print (x_train)
    return mor, mse, r2, cvs
