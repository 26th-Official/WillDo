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
                                
# =====================================
# This is to handle the object id in mongo db since it is not json serializable
from bson.objectid import ObjectId

# To Hash the Password before storing in Database
from bcrypt import gensalt,hashpw,checkpw

# To handle date and time
from datetime import timedelta
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
    print(data)
    PostResult = collection.insert_one(data)

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
    
    response = jsonify({"Message" : {
        "Status" : "success",
        "Operation" : "Task Updated"
    }})
    
    if OriginalItem == ModifiedItem:
        return response,200

    try:
        OriginalItem["_id"] = ObjectId(OriginalItem["_id"])
        ModifiedItem["_id"] = ObjectId(ModifiedItem["_id"])
        ModifiedItem = {"$set" : ModifiedItem}
        print(OriginalItem, ModifiedItem)
        collection.update_many({"_id":  OriginalItem["_id"]},ModifiedItem)
        
    except KeyError:
        ModifiedItem = {"$set" : ModifiedItem}
        collection.update_many(OriginalItem,ModifiedItem)
      
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

# *====================================================================

# !================= Authentication ===================================

# This is to Handle the Signup Process
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
        
  
# This is to Handle the SignIn Process
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


# This is to get new Refresh Tokens
@app.route("/refresh")
@jwt_required(refresh=True,verify_type=True)
def TokenRefresh():
    response = jsonify({"Message" : {
        "Status" : "success",
    }})
    access_token = create_access_token(identity={"Username" : get_jwt_identity()})
    set_access_cookies(response,access_token)
    return response


# This is to signout and unset both the Access and Refresh Token
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

# ?========================== Setting =================================

@app.route('/settings')
def Settings():
    pass

# ?====================================================================


if __name__ == '__main__':
    # Now we are starting the server
    app.run(port=6565)

