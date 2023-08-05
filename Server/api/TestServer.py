from flask import Flask,jsonify,request
from flask_jwt_extended import JWTManager,create_access_token,jwt_required,set_access_cookies
from flask_cors import CORS

app = Flask(__name__)
CORS(app,supports_credentials=True)

app.config["JWT_SECRET_KEY"] = "safd5afsd21fafd54asdf2sd65czxv5w6f4dsa15fa"
app.config["JWT_TOKEN_LOCATION"] = ["cookies"]


jwt = JWTManager(app)


@app.route("/")
def Home():
    return jsonify({"Message" : "Hello World"},200)

@app.route("/get_cookie")
def Get_Cookie():
    access_token = create_access_token(identity="Hello")
    response = jsonify({"access_token":access_token})
    set_access_cookies(response,access_token)
    return response,200

@app.route("/protected")
@jwt_required()
def Protected():
    return jsonify({"Message" : "Suppeerrr Secret ***** "})


if __name__ == "__main__":
    app.run(port=9595)