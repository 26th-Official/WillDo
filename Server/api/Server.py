# Importing the required modules

from flask import Flask, jsonify, request
from flask_cors import CORS

# For realtime updation of data
from flask_socketio import SocketIO

from flask_jwt_extended import JWTManager,jwt_required,create_access_token,set_refresh_cookies,\
                                set_access_cookies,unset_access_cookies,unset_refresh_cookies,\
                                create_refresh_token,decode_token,get_jwt_identity,get_jwt
                                

# =====================================

# This is to handle the object id in mongo db since it is not json serializable
from bson.objectid import ObjectId

from bcrypt import gensalt,hashpw,checkpw
from datetime import timedelta,timezone,datetime

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
CORS(app, supports_credentials=True)
# socketio = SocketIO(app,cors_allowed_origins="*",cors_credentials=True)

app.config["JWT_SECRET_KEY"] = '846465498464987646sdf546548sd4651sfadf4as654fd'
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=1)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(minutes=5)
app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
app.config['JWT_COOKIE_CSRF_PROTECT'] = True
app.config['JWT_COOKIE_SECURE'] = True
app.config['JWT_CSRF_CHECK_FORM'] = True

jwt = JWTManager(app)



# ?====================================================

# This is for the checking the logs in DB for the purpose of sending signal to frontend
DB_CheckPipeline = [{"$match" : {
    "operationType" : {
        "$in" : ["insert","update","replace","delete"]
    }
}}]

# This is for the checking the logs in DB for the purpose of sending signal to frontend
# def DB_Update():
#     print("============Process Started=============")
#     with collection.watch(DB_CheckPipeline) as stream:
#         for update in stream:
#             print("============ DB Updated ============")
#             socketio.emit("DB_Update")

# ?====================================================

# This is to inset data into DB
@app.route("/new", methods=["POST"])
@jwt_required()
def PostData():
    data = request.get_json()
    print(data)
    PostResult = collection.insert_one(data)
    # socketio.emit("DB_Update")
    response = jsonify({"Message" : {
        "Status" : "success",
        "Operation" : "Task Added"
    }})
    return response,200


# This is to delete data from DB
@app.route("/delete", methods=["POST"])
@jwt_required()
def DeleteData():
    data = request.get_json()
    data["_id"] = ObjectId(data["_id"])
    print(data)
    collection.delete_one({"_id":  data["_id"]})
    # socketio.emit("DB_Update")
    response = jsonify({"Message" : {
        "Status" : "success",
        "Operation" : "Task Deleted"
    }})
    return response,200


# This is to update data in DB
@app.route("/update", methods=["POST"])
@jwt_required()
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
    # socketio.emit("DB_Update")
    
    response = jsonify({"Message" : {
        "Status" : "success",
        "Operation" : "Task Updated"
    }})
    return response,200


# This is to get all the data from DB
@app.route("/fetch")
@jwt_required()
def Fetch():
    Tasks = []
    for i in collection.find():
        # we are converting the id from object to string
        i["_id"] = str(i["_id"])
        Tasks.append(i)
        
    response = jsonify({"Message" : {
        "Status" : "success",
        "Operation" : "Tasks Fetched",
        "Data" : Tasks
    }})
    return response,200

# !================= Authentication ===================================


@app.route("/signup",methods=["POST"])
def SignUp():
    data = request.get_json()
    print(data)
    HashedPassword = hashpw(data["Password"].encode("utf-8"),gensalt())
    if User_Collection.find_one({"Username" : data["Username"]}) != None:
        response = jsonify({"Message" : {
            "Status" : "denied",
            "Operation" : "User Already Exists",
        }})
        return response,409
    
    PostResult = User_Collection.insert_one({**data,"Password":HashedPassword})
    
    response = jsonify({"Message" : {
        "Status" : "success",
        "Operation" : "User Signed Up",
    }})
    return response,200
        
  

@app.route("/signin",methods=["POST"])
def SignIn():
    data = request.get_json()
    print(data)
    user_result = User_Collection.find_one({"Username" : data["Username"]})
    if not user_result:
        response = jsonify({"Message" : {
            "Status" : "failed",
            "Operation" : "User Doesn't Exist",
        }})
        return response,404
    
    if not checkpw(data["Password"].encode("utf-8"),user_result["Password"]):
        response = jsonify({"Message" : {
            "Status" : "success",
            "Operation" : "Wrong Credentials",
        }})
        return response,401
    
    access_token = create_access_token(identity={"Username" : data["Username"]})
    refresh_token = create_refresh_token(identity={"Username" : data["Username"]})
    response = jsonify({"Message" : {
        "Status" : "success",
        "Operation" : "User Signed In",
    }})
    set_access_cookies(response,access_token)
    set_refresh_cookies(response,refresh_token)
    return response,200

@app.route("/refresh")
@jwt_required(refresh=True,verify_type=True)
def TokenRefresh():
    response = jsonify({"Message" : {
        "Status" : "success",
    }})
    access_token = create_access_token(identity={"Username" : get_jwt_identity()})
    set_access_cookies(response,access_token)
    return response


@app.route("/signout")
def SignOut():
    response = jsonify({"Message" : {
        "Status" : "success",
        "Operation" : "User Signed Out",
    }})
    unset_access_cookies(response)
    unset_refresh_cookies(response)
    
    return response,200

# !====================================================================



# ?====================================================


if __name__ == '__main__':
    # we are starting the DB_Update function in a thread to avoid blocking of the main thread
    # Task1 = Thread(target=DB_Update)
    # Task1.start()
    
    # Now we are starting the server
    app.run(port=6565)
    # socketio.run(app,port=6565,debug=False)

