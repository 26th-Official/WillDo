# Importing the required modules

# =====================================
# Basic packages
import os
from pprint import pprint
from datetime import timedelta,datetime


# To make REST API
from flask import Flask, jsonify, request

# To Handle Cross-Site Requests
from flask_cors import CORS

# To Handle Token based Authentication
from flask_jwt_extended import JWTManager,jwt_required,create_access_token,set_refresh_cookies,\
                                set_access_cookies,unset_access_cookies,unset_refresh_cookies,\
                                create_refresh_token,get_jwt_identity,decode_token
            
# For Production server 
from waitress import serve                                

# =====================================
# This is to handle the object id in mongo db since it is not json serializable
from bson.objectid import ObjectId

# To Hash the Password before storing in Database
from bcrypt import gensalt,hashpw,checkpw

# =====================================
# For accessing the Mongo DB
from pymongo import UpdateOne
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

# =====================================
# For Emailing Purposes
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from email.mime.text import MIMEText
# for Encoding support
import base64
# For OTP generation
from random import randint

# for getting .env variables
from dotenv import load_dotenv

# =====================================

# ?====================================================

# .env variable configs
load_dotenv(dotenv_path=".env")

# DB configs
uri = os.getenv("MONGOURL")
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
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=30)
app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
app.config['JWT_COOKIE_CSRF_PROTECT'] = False
app.config['JWT_COOKIE_SECURE'] = True
app.config['JWT_CSRF_CHECK_FORM'] = False
app.config['JWT_COOKIE_SAMESITE'] = "None"

# Email Configs
Credential = Credentials.from_authorized_user_info({
    "client_id": os.getenv("CLIENT_ID"),
    "client_secret": os.getenv("CLIENT_SECRET"),
    "refresh_token" : os.getenv("REFRESH_TOKEN"),
})
Service = build("gmail","v1",credentials=Credential)

# @app.before_request
# def tesss():
#     print(os.getenv("MONGOURL"))
#     pass

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
    
    RequestArguments = request.args.to_dict()
    UserID = {"UserID" : RequestArguments["UserID"]}
    TaskID = int(datetime.now().timestamp())
    
    # DeleteType has 3 options "fromTasks", "fromTrash" and "fromTrashAll"
    if RequestArguments["DeleteType"] == "fromTasks":
        Updates = []
        
        Updates.append(
            UpdateOne(UserID,
            {
                "$pull" : {"Tasks" : {"TaskID" : data["TaskID"]}}
            })
        )
        Updates.append(
            UpdateOne(UserID,
            {
                "$push" : {"DeletedTasks" : {**data, "TaskID" : TaskID}}
            })
        )
        
        collection.bulk_write(Updates)
        
        response = jsonify({
            "Status" : "success",
            "Operation" : "Task Deleted"
        })
        
        return response,200
    
    elif RequestArguments["DeleteType"] == "fromTrashAll":
        
        collection.update_one(UserID,
        {
            "$set" : {"DeletedTasks" : []}
        })
        
        response = jsonify({
            "Status" : "success",
            "Operation" : "All Trash Deleted"
        })
        
        return response,200
    
    elif RequestArguments["DeleteType"] == "fromTrash":
        collection.update_one(UserID,
        {
            "$pull" : {"DeletedTasks" : {"TaskID" : data["TaskID"]}}
        })
                
        response = jsonify({
            "Status" : "success",
            "Operation" : "Task Deleted Permanently"
        })
        
        return response,200
    
# To retreive deleted task and add them to main tasks in DB
@app.route("/retreive", methods=["POST"])
@jwt_required()
def RetreiveData():
    data = request.get_json()
    pprint(data)
    
    RequestArguments = request.args.to_dict()
    UserID = {"UserID" : RequestArguments["UserID"]}
    TaskID = int(datetime.now().timestamp())
    
    Updates = []
    
    Updates.append(
        UpdateOne(UserID,
        {
            "$push" : {"Tasks" : {**data, "TaskID" : TaskID}}
        })
    )
        
    Updates.append(
        UpdateOne(UserID,
        {
             "$pull" : {"DeletedTasks" : {"TaskID" : data["TaskID"]}}
        })
    )
    
    collection.bulk_write(Updates)
    
    response = jsonify({
        "Status" : "success",
        "Operation" : "Task Retreived"
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
    
    Results = collection.find_one(UserID)
        
    response = jsonify({
        "Status" : "success",
        "Operation" : "Tasks Fetched",
        "Tasks" : Results["Tasks"],
        "DeletedTasks" : Results["DeletedTasks"]
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
    
    if User_Collection.find_one({"Email" : data["Email"]}) != None:
        response = jsonify({"Message" : {
            "Status" : "denied",
            "Operation" : "User Already Exists",
        }})
        return response,409
    
    PostResult = User_Collection.insert_one({
        **data,
        "Password":HashedPassword,
        "SessionDuration" : 1,
        "OTP" : 0
    })
    
    collection.insert_one({
        "UserID" : str(PostResult.insertedTaskID),
        "Tasks" : [],
        "DeletedTasks" : []
    })
    
    response = jsonify({
        "Status" : "success",
        "Operation" : "User Signed Up",
    })
    return response,200
        
  
# This is to Handle the SignIn Process
@app.route("/signin", methods=["POST"])
def SignIn():
    data = request.get_json()
    pprint(data)
    UserData = User_Collection.find_one({"Email" : data["Email"]})
    
    if not UserData:
        response = jsonify({
            "Status" : "failed",
            "Operation" : "User Doesn't Exist",
        })
        return response,404
    
    if not checkpw(data["Password"].encode("utf-8"),UserData["Password"]):
        response = jsonify({
            "Status" : "failed",
            "Operation" : "Wrong Credentials",
        })
        return response,401
    
    access_token = create_access_token(identity={"Email" : data["Email"]})
    refresh_token = create_refresh_token(identity={"Email" : data["Email"]},expires_delta=timedelta(days=UserData["SessionDuration"]))
    response = jsonify({
        "Status" : "success",
        "Operation" : "User Signed In",
        "UserID" : str(UserData["_id"]),
        "SessionDuration" : str(UserData["SessionDuration"])
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
    access_token = create_access_token(identity={"Email" : get_jwt_identity()})
    set_access_cookies(response,access_token)
    return response


@app.route("/reset", methods=["POST"])
def ResetPassword():
    data = request.get_json()
    pprint(data)
    
    _id = { "_id" : ObjectId(str((request.args.get("UserID"))))}
    
    UserData = User_Collection.find_one({
        **_id
    })
    
    if not checkpw(data["CurrentPassword"].encode("utf-8"),UserData["Password"]):
        response = jsonify({
            "Status" : "failed",
            "Operation" : "Wrong Credentials",
        })
        return response,401
    
    HashedPassword = hashpw(data["NewPassword"].encode("utf-8"),gensalt())
    
    User_Collection.update_one({
        **_id
    }, {
        "$set" : {"Password" : HashedPassword}
    })
    
    response = jsonify({
        "Status" : "success",
        "Operation" : "Password Resetted",
    })
    
    return response,200


@app.route("/forgotpassword", methods=["POST"])
def ForgotPassword():
    data = request.get_json()
    pprint(data)
    
    # Generate, Verify and Reset are the Operation Types
    OperationType = request.args.get("OperationType")
    
    if OperationType == "Generate":
        UserData = User_Collection.find_one({"Email" : data["Email"]})
        
        if not UserData:
            response = jsonify({
                "Status" : "failed",
                "Operation" : "User Doesn't Exist",
            })
            return response,404
        
        OTP = randint(100000,999999)
        
        User_Collection.update_one({
            "Email" : data["Email"]
        }, {
            "$set" : {"OTP" : OTP}
        })
        
        HTML_Body = f"""
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; color: white;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: rgb(35, 35, 35); border: 1px solid rgb(64, 64, 64); border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                    <div style="text-align: center;">
                        <h1 style="color: rgb(250, 204, 21); text-decoration: underline; text-decoration-thickness: 1px;">WillDo</h1>
                        <h3 style="color: rgb(255, 255, 255);">Password Reset OTP</h3>
                    </div>
                    <p>Hello,</p>
                    <p>Your One-Time Password (OTP) for resetting your password on the WillDo is:</p>
                    <div style="background-color: rgb(64, 64, 64); padding: 10px; text-align: center; border-radius: 5px;">
                        <h2 style="margin: 0; color: rgb(250, 204, 21);">{OTP}</h2>
                    </div>
                    <p>Please use this OTP to reset your password.</p>
                    <p>If you did not request this OTP, please ignore this email.</p>
                    <p style="color: rgb(146, 146, 146); text-align: center;">Thank you for using WillDo.</p>
                </div>
            </body>
        </html>
        """
        
        Message = MIMEText(HTML_Body,"html")
        Message["to"] = data["Email"]
        Message["from"] = "Will Do <willdo.client@gmail.com>"
        Message["subject"] = "Verification from WillDo"
        MessageBody = {
            "raw" : base64.urlsafe_b64encode(Message.as_bytes()).decode()
        }
        
        Message = Service.users().messages().send(userId="me",body=MessageBody).execute()
        print(f"Sucessfully sent - {Message['id']}")
        
        response = jsonify({
            "Status" : "success",
            "Operation" : "Verification Mail Sent",
        })
        
        return response,200
        
    
    elif OperationType == "Verify":
        
        UserData = User_Collection.find_one({
            "Email" : data["Email"]
        })
        pprint(UserData)
        
        if int(UserData["OTP"]) == int(data["OTP"]):
            response = jsonify({
                "Status" : "success",
                "Operation" : "Verification Successful",
                "UserID" : str(UserData["_id"])
            })
            
            return response,200
        
        response = jsonify({
            "Status" : "failed",
            "Operation" : "Verification Unsuccessful",
        })
        
        return response,401
    
    
    elif OperationType == "Reset":
        
        _id = { "_id" : ObjectId(str((request.args.get("UserID"))))}
        
        HashedPassword = hashpw(data["NewPassword"].encode("utf-8"),gensalt())
        
        User_Collection.update_one({
            **_id
        }, {
            "$set" : {"Password" : HashedPassword}
        })
        
        response = jsonify({
            "Status" : "success",
            "Operation" : "Password Resetted",
        })
        
        return response,200
    

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

@app.route("/settings", methods=["POST"])
@jwt_required()
def Settings():
    data = request.get_json()
    print(data)
    
    _id = { "_id" : ObjectId(str((request.args.get("UserID"))))}

    User_Collection.update_one({
        **_id
    }, {
        "$set" : {"SessionDuration" : int(data["SessionDuration"])}
    })
    
    response = jsonify({
        "Status" : "success",
        "Operation" : "Settings Updated",
    })
    
    return response,200

# ?====================================================================

@app.route("/health")
def HealthTest():
    return jsonify({
        "Status" : "success",
        "Message" : "Its Working Correctly",
    }),200

# ?====================================================================

if __name__ == '__main__':
    # Now we are starting the server
    app.run(port=6565)
    # serve(app,host="0.0.0.0",port=6565)

