import numpy as np
import pickle

#loading the saved model
loadedModel = pickle.load(open('D:/Numpy and Pandas Tutorial/trained_model.sav', 'rb'))

input_data = (5,166,72,19,175,25.8,0.587,51)

# changing the input data into numpy array
input_data_as_nparr = np.asarray(input_data)

# reshape the array as we are predictingfor one instance
input_data_reshaped = input_data_as_nparr.reshape(1,-1)

prediction = loadedModel.predict(input_data_reshaped)
print(prediction)

if (prediction[0] == 0):
    print('The Person is not Diabetic')
else:
    print('The person is Diabetic')