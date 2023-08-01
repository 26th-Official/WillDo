# Importing the required modules

from flask import Flask, jsonify, request
from flask_cors import CORS

# For realtime updation of data
from flask_socketio import SocketIO

# =====================================

# This is to handle the object id in mongo db since it is not json serializable
from bson.objectid import ObjectId

import bcrypt
import time

# =====================================
# For accessing the Mongo DB
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

# for multithreading purpose
from threading import Thread

# ?====================================================

# DB configs
uri = "mongodb+srv://26th_Official:qwerty123@willdo.svxpxac.mongodb.net/?retryWrites=true&w=majority"
client = MongoClient(uri, server_api=ServerApi("1"))
db = client["Data"]
collection = db["UserData"]
User_Collection = db["Users"]

# Initializing Flask and Socket with CORS
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app,cors_allowed_origins="*")

# This is for the checking the logs in DB for the purpose of sending signal to frontend
DB_CheckPipeline = [{"$match" : {
    "operationType" : {
        "$in" : ["insert","update","replace","delete"]
    }
}}]

# ?====================================================


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
    socketio.emit("DB_Update")
    return jsonify({"status": "success", "id": str(PostResult.inserted_id)})


# This is to delete data from DB
@app.route("/delete", methods=["POST"])
def DeleteData():
    data = request.get_json()
    data["_id"] = ObjectId(data["_id"])
    print(data)
    collection.delete_one({"_id":  data["_id"]})
    socketio.emit("DB_Update")
    return jsonify({"status": "success"})


# This is to update data in DB
@app.route("/update", methods=["POST"])
def UpdateData():
    data = request.get_json()
    OriginalItem = data["OriginalItem"]
    ModifiedItem = data["ModifiedItem"]

    OriginalItem["_id"] = ObjectId(OriginalItem["_id"])
    ModifiedItem["_id"] = ObjectId(ModifiedItem["_id"])
    
    ModifiedItem = {"$set" : ModifiedItem}
    # print({"_id":  OriginalItem["_id"]},ModifiedItem)
    print(OriginalItem,ModifiedItem)
    
    collection.update_many({"_id":  OriginalItem["_id"]},ModifiedItem)
    socketio.emit("DB_Update")
    return jsonify({"status": "success"})


# This is to get all the data from DB
@app.route("/getall")
def GetAll():
    temp = []
    for i in collection.find():
        # we are converting the id from object to string
        i["_id"] = str(i["_id"])
        temp.append(i)
    return jsonify(temp)


# !================= Authentication ===================================

@app.route("/signup",methods=["POST"])
def SignUp():
    data = request.get_json()
    print(data)
    HashedPassword = bcrypt.hashpw(data["Password"].encode("utf-8"),bcrypt.gensalt())
    if User_Collection.find_one({"Username" : data["Username"]}) == None:
        PostResult = User_Collection.insert_one({**data,"Password":HashedPassword})
        return jsonify({"status":"success", "id": str(PostResult.inserted_id)})
    else:
        return jsonify({"status":"failed", "reason": "User Already Exists!"},400)


@app.route("/signin",methods=["POST"])
def SignIn():
    data = request.get_json()
    print(data)
    user_result = User_Collection.find_one({"Username" : data["Username"]})
    if not user_result:
        return jsonify({"status":"failed", "reason": "User Doesn't Exist!"},404) 
    
    if bcrypt.checkpw(data["Password"].encode("utf-8"),user_result["Password"]):
        return jsonify({"status":"success"})
    else:
        return jsonify({"status":"failed", "reason": "Password Wrong!"},401) 

# !====================================================================



# ?====================================================


if __name__ == '__main__':
    # we are starting the DB_Update function in a thread to avoid blocking of the main thread
    Task1 = Thread(target=DB_Update)
    Task1.start()
    
    # Now we are starting the server
    socketio.run(app,port=6565,debug=False)

