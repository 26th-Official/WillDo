from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from threading import Thread

uri = "mongodb+srv://26th_Official:qwerty123@willdo.svxpxac.mongodb.net/?retryWrites=true&w=majority"
client = MongoClient(uri, server_api=ServerApi("1"))
db = client["Data"]
collection = db["UserData"]

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app,cors_allowed_origins="*")

DB_CheckPipeline = [{"$match" : {
    "operationType" : {
        "$in" : ["insert","update","replace","delete"]
    }
}}]

def DB_Update():
    print("============Process Started=============")
    with collection.watch(DB_CheckPipeline) as stream:
        for update in stream:
            print("============ DB Updated ============")
            socketio.emit("DB_Update")


@app.route("/post", methods=["POST"])
def PostData():
    data = request.get_json()
    print(data)
    PostResult = collection.insert_one(data)
    return jsonify({"status": "success", "id": str(PostResult.inserted_id)})


@app.route("/get", methods=["GET"])
def GetData():
    pass


@app.route("/getall")
def GetAll():
    temp = []
    for i in collection.find():
        i["_id"] = str(i["_id"])
        temp.append(i)
    return jsonify(temp)


if __name__ == '__main__':
    Task1 = Thread(target=DB_Update)
    Task1.start()
    socketio.run(app,port=6565)

