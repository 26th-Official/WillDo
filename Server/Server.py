# Importing the required modules

from flask import Flask, jsonify, request
from flask_cors import CORS

# For realtime updation of data
from flask_socketio import SocketIO

# =====================================
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

# for multithreading purpose
from threading import Thread

# =====================================

# DB configs
uri = "mongodb+srv://26th_Official:qwerty123@willdo.svxpxac.mongodb.net/?retryWrites=true&w=majority"
client = MongoClient(uri, server_api=ServerApi("1"))
db = client["Data"]
collection = db["UserData"]

# Initializing Flask and Socket with CORS
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app,cors_allowed_origins="*")

# THis is for the checking the logs in DB for the purpose of sending signal to frontend
DB_CheckPipeline = [{"$match" : {
    "operationType" : {
        "$in" : ["insert","update","replace","delete"]
    }
}}]

# This is for the checking the logs in DB for the purpose of sending signal to frontend
def DB_Update():
    print("============Process Started=============")
    with collection.watch(DB_CheckPipeline) as stream:
        for update in stream:
            print("============ DB Updated ============")
            socketio.emit("DB_Update")


# This is to inset data into DB
@app.route("/post", methods=["POST"])
def PostData():
    data = request.get_json()
    print(data)
    PostResult = collection.insert_one(data)
    return jsonify({"status": "success", "id": str(PostResult.inserted_id)})


@app.route("/get", methods=["GET"])
def GetData():
    pass

# This is to get all the data from DB
@app.route("/getall")
def GetAll():
    temp = []
    for i in collection.find():
        # we are converting the id from object to string
        i["_id"] = str(i["_id"])
        temp.append(i)
    return jsonify(temp)


if __name__ == '__main__':
    # we are starting the DB_Update function in a thread to avoid blocking of the main thread
    Task1 = Thread(target=DB_Update)
    Task1.start()
    # Now we are starting the server
    socketio.run(app,port=6565)

