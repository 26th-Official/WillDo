from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
from threading import Thread
import time
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

uri = "mongodb+srv://26th_Official:qwerty123@willdo.svxpxac.mongodb.net/?retryWrites=true&w=majority"

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))

db = client["Data"]
collection = db["UserData"]

DB_CheckPipeline = [{"$match" : {
    "operationType" : {
        "$in" : ["insert","update","replace","delete"]
    }
}}]

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins='*')

@socketio.on('connect')
def handle_connect():
    socketio.emit('message', "Hello from Flask!")
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    socketio.emit('message', "Bye from Flask!")
    print('Client disconnected')

count = 0    
def test():
    # while True:
    #     global count
    #     print(f"========{count}========")
    #     socketio.emit('DB_Update', f"Hello from Flask! {count}")
    #     count += 1    
    #     time.sleep(1)
    print("============Process Started=============")
    with collection.watch(DB_CheckPipeline) as stream:
        for insert_change in stream:
            print(insert_change)
            print("Yeahh")
            socketio.emit("DB_Update")

if __name__ == '__main__':
    Task1 = Thread(target=test)
    Task1.start()
    socketio.run(app,port=6565)
