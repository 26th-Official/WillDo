from flask import Flask, jsonify
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

uri = "mongodb+srv://26th_Official:qwerty123@willdo.svxpxac.mongodb.net/?retryWrites=true&w=majority"
client = MongoClient(uri, server_api=ServerApi('1'))
db = client["Data"]
collection = db["UserData"]

app = Flask(__name__)
CORS(app)

@app.route("/data")
def senddata():
    return jsonify({ "Hello" : ["duck", "monkey", "butterfly" ]})

@app.route("/post/<data>")
def SendData(data):
    pass

@app.route("/get/<data>")
def GetData(data):
    pass

@app.route("/get")
def GetAll():
    temp = []
    for i in collection.find():
        i["_id"] = str(i["_id"])
        temp.append(i)
    return jsonify(temp)
        

if __name__ == "__main__":
    app.run(debug=True,port=6565)