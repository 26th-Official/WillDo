# Importing the required modules

# =====================================
# To make REST API
from flask import Flask, jsonify, request

# To Handle Cross-Site Requests
from flask_cors import CORS

# To Handle Token based Authentication
from flask_jwt_extended import JWTManager,jwt_required,create_access_token,set_refresh_cookies,\
                                set_access_cookies,unset_access_cookies,unset_refresh_cookies,\
                                create_refresh_token,get_jwt_identity
                                
from waitress import serve                                

# =====================================
# This is to handle the object id in mongo db since it is not json serializable
from bson.objectid import ObjectId

# To Hash the Password before storing in Database
from bcrypt import gensalt,hashpw,checkpw

# To handle date and time
from datetime import timedelta,datetime

# Pretty Print
from pprint import pprint

# =====================================
# For accessing the Mongo DB
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
# =====================================

# ?====================================================

# DB configs
uri = "mongodb+srv://26th_Official:qwerty123@willdo.svxpxac.mongodb.net/?retryWrites=true&w=majority"
client = MongoClient(uri, server_api=ServerApi("1"))
db = client["Data"]
collection = db["UserData"]
User_Collection = db["Users"]

# Initializing Flask with CORS
app = Flask(__name__)
CORS(app, supports_credentials=True)
# Initializing the JWT
jwt = JWTManager(app)

# Flask Variables for Flask-JWT
app.config["JWT_SECRET_KEY"] = '846465498464987646sdf546548sd4651sfadf4as654fd'
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(seconds=10)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=1)
app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
app.config['JWT_COOKIE_CSRF_PROTECT'] = True
app.config['JWT_COOKIE_SECURE'] = True
app.config['JWT_CSRF_CHECK_FORM'] = True



# *===================CRUD Operations=================================

# This is to inset data into DB
@app.route("/new", methods=["POST"])
@jwt_required()
def PostData():
    data = request.get_json()
    pprint(data)
    
    UserID = { "UserID" : (request.args.get("UserID"))}
    
    TaskID = int(datetime.now().timestamp())
    collection.update_one(UserID,{
        "$push" : {"Tasks" : {**data, "TaskID" : TaskID}}
    })

    response = jsonify({
        "Status" : "success",
        "Operation" : "Task Added",
        "TaskID" : TaskID
    })
    
    return response,200


# This is to delete data from DB
@app.route("/delete", methods=["POST"])
@jwt_required()
def DeleteData():
    data = request.get_json()
    pprint(data)
    
    UserID = { "UserID" : (request.args.get("UserID"))}
    
    collection.update_one(UserID,
    {
        "$pull" : {"Tasks" : {"TaskID" : data["TaskID"]}}
    })
    
    response = jsonify({
        "Status" : "success",
        "Operation" : "Task Deleted"
    })
    
    return response,200


# This is to update data in DB
@app.route("/update", methods=["POST"])
@jwt_required()
def UpdateData():
    data = request.get_json()
    pprint(data)
    
    OriginalItem = data["OriginalItem"]
    ModifiedItem = data["ModifiedItem"]
    
    response = jsonify({
        "Status" : "success",
        "Operation" : "Task Updated"
    })
    
    if OriginalItem == ModifiedItem:
        return response,200
        
    UserID = { "UserID" : (request.args.get("UserID"))}
    
    collection.update_one({
            **UserID,
            "Tasks.TaskID" : OriginalItem["TaskID"]
        }, {
            "$set" : {"Tasks.$" : ModifiedItem}
        })
      
    return response,200


# This is to get all the data from DB
@app.route("/fetch")
@jwt_required()
def Fetch():    
    UserID = { "UserID" : (request.args.get("UserID"))}
    
    Tasks = collection.find_one(UserID)["Tasks"]
        
    response = jsonify({
        "Status" : "success",
        "Operation" : "Tasks Fetched",
        "Data" : Tasks
    })
    return response,200

# *====================================================================

# !================= Authentication ===================================

# This is to Handle the Signup Process
@app.route("/signup",methods=["POST"])
def SignUp():
    data = request.get_json()
    pprint(data)
    HashedPassword = hashpw(data["Password"].encode("utf-8"),gensalt())
    if User_Collection.find_one({"Username" : data["Username"]}) != None:
        response = jsonify({"Message" : {
            "Status" : "denied",
            "Operation" : "User Already Exists",
        }})
        return response,409
    
    PostResult = User_Collection.insert_one({**data,"Password":HashedPassword})
    collection.insert_one({
        "UserID" : str(PostResult.insertedTaskID),
        "Tasks" : []
    })
    
    response = jsonify({
        "Status" : "success",
        "Operation" : "User Signed Up",
    })
    return response,200
        
  
# This is to Handle the SignIn Process
@app.route("/signin",methods=["POST"])
def SignIn():
    data = request.get_json()
    pprint(data)
    user_result = User_Collection.find_one({"Username" : data["Username"]})
    if not user_result:
        response = jsonify({
            "Status" : "failed",
            "Operation" : "User Doesn't Exist",
        })
        return response,404
    
    if not checkpw(data["Password"].encode("utf-8"),user_result["Password"]):
        response = jsonify({
            "Status" : "failed",
            "Operation" : "Wrong Credentials",
        })
        return response,401
    
    access_token = create_access_token(identity={"Username" : data["Username"]})
    refresh_token = create_refresh_token(identity={"Username" : data["Username"]})
    response = jsonify({
        "Status" : "success",
        "Operation" : "User Signed In",
        "UserID" : str(user_result["_id"])
    })
    set_access_cookies(response,access_token)
    set_refresh_cookies(response,refresh_token)
    return response,200


# This is to get new Refresh Tokens
@app.route("/refresh")
@jwt_required(refresh=True,verify_type=True)
def TokenRefresh():
    response = jsonify({
        "Status" : "success",
    })
    access_token = create_access_token(identity={"Username" : get_jwt_identity()})
    set_access_cookies(response,access_token)
    return response


# This is to signout and unset both the Access and Refresh Token
@app.route("/signout")
def SignOut():
    response = jsonify({
        "Status" : "success",
        "Operation" : "User Signed Out",
    })
    unset_access_cookies(response)
    unset_refresh_cookies(response)
    
    return response,200

# !====================================================================

# ?========================== Setting =================================

@app.route('/settings')
def Settings():
    pass

# ?====================================================================


if __name__ == '__main__':
    # Now we are starting the server
    app.run(port=6565)
    # serve(app,host="0.0.0.0",port=6565)
