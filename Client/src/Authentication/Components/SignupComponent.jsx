import React, { useState, useRef } from "react";
import axios from "../../Modules/axios";
import { HeaderComponent } from "../../Components/AdditionalComponents";
import { useNavigate } from "react-router-dom";

const SignupComponent = ({setAuthMode}) => {

	const [AuthData, setAuthData] = useState({
		Username: "",
		Password: "",
		FirstName: "",
		LastName: "",
	});

    const Messages = ["","Username already exists!", "Please Enter a Valid Password", "Please enter all the Fields"]

	const [ErrorMessage, setErrorMessage] = useState(Messages[0]); // 👆

	const [Loading, setLoading] = useState(false);

	const AuthRef = useRef([]);

	const Navigate = useNavigate()

	const PasswordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%&*?])[A-Za-z\d!@#$%^&*?]{8,}$/;

    function Authentication(UserData) {
        // This is to sign up the user
        setLoading(true)
        axios.post("/signup",UserData).then((data) => 
        {
            if (data[1] === 400){
                setLoading(false)
                console.warn("Username already exists!")
                setErrorMessage(Messages[1]) // "Username already exists!"
            }
            else {
                setLoading(false)
                console.warn("Successfully Signed Up!!")
                alert("Successfully Signed Up!!")
                setAuthData({
                    Username : "",
                    Password : "",
                    FirstName : "",
                    LastName : ""
                })
				setAuthMode("SignIn")
                Navigate("/signin")
            }
        })
    }

	return (
		<div className="flex flex-col items-center">
			<HeaderComponent />
			<div className="h-4" />
			<div
				className={`bg-primary p-5 w-[350px] flex flex-col items-center rounded-md border my-5`}>
				{ErrorMessage !== "" && (
					<div className="w-full">
						<div className=" rounded-md p-2 bg-red-500">
							<p className="text-left">{ErrorMessage}</p>
						</div>
						<br />
					</div>
				)}
				<div className="w-full">
					<p className="text-left text-md">First Name</p>
					<input
						id="Firstname_Field"
						ref={(el) => (AuthRef.current[0] = el)}
						value={AuthData !== {} && AuthData.FirstName}
						onChange={(e) =>
							setAuthData({
								...AuthData,
								FirstName: e.target.value,
							})
						}
						onKeyDown={(e) => KeyPress(e, 1)}
						onFocus={(e) =>
							(e.target.style.outline =
								"0.7px solid rgba(255,255,255,1)")
						}
						onBlur={(e) => (e.target.style.outline = "none")}
						autoFocus
						required
						placeholder="Please Enter your First Name"
						className="bg-black/90 min-h-[24px] w-full rounded-md text-white p-1 my-2"
					/>
					<div className="h-3" />
					<p className="text-left text-md">Last Name</p>
					<input
						id="Lastname_Field"
						ref={(el) => (AuthRef.current[1] = el)}
						value={AuthData !== {} && AuthData.LastName}
						onChange={(e) =>
							setAuthData({
								...AuthData,
								LastName: e.target.value,
							})
						}
						onFocus={(e) =>
							(e.target.style.outline =
								"0.7px solid rgba(255,255,255,1)")
						}
						onBlur={(e) => (e.target.style.outline = "none")}
						onKeyDown={(e) => KeyPress(e, 2)}
						required
						placeholder="Please Enter your Last name"
						className="bg-black/90 min-h-[24px] w-full rounded-md text-white p-1 my-2"
					/>
					<div className="h-3" />
					<p className="text-left text-md">Username</p>
					<input
						id="Username_Field"
						ref={(el) => (AuthRef.current[2] = el)}
						value={AuthData !== {} && AuthData.Username}
						onChange={(e) =>
							setAuthData({
								...AuthData,
								Username: e.target.value,
							})
						}
						onFocus={(e) =>
							(e.target.style.outline =
								"0.7px solid rgba(255,255,255,1)")
						}
						onBlur={(e) => (e.target.style.outline = "none")}
						onKeyDown={(e) => KeyPress(e, 3)}
						required
						placeholder="Please Enter your Username"
						className="bg-black/90 min-h-[24px] w-full rounded-md text-white p-1 my-2"
					/>
					<div className="h-3" />
					<p className="text-left text-md">Password</p>
					<input
						id="Password_Field"
						ref={(el) => (AuthRef.current[3] = el)}
						value={AuthData !== {} && AuthData.Password}
						onChange={(e) =>
							setAuthData({
								...AuthData,
								Password: e.target.value,
							})
						}
						onFocus={(e) =>
							(e.target.style.outline =
								"0.7px solid rgba(255,255,255,1)")
						}
						onBlur={(e) => (e.target.style.outline = "none")}
						required
						placeholder="Please Enter your Password"
						className="bg-black/90 min-h-[24px] w-full rounded-md text-white p-1 my-2"
						type="password"
					/>
				</div>

				<div className="h-3" />
				<div
					onClick={() => {
						setErrorMessage(Messages[0]);
						if (
							AuthRef.current[0].value === "" ||
							AuthRef.current[1].value === "" ||
							AuthRef.current[2].value === "" ||
							AuthRef.current[3].value === ""
						) {
							for (let i = 0; i < AuthRef.current.length; i++) {
								if (AuthRef.current[i].value === "") {
									AuthRef.current[i].style.outline =
										"0.7px solid rgb(239,68,68)";
								}
							}
							console.warn("Fill all the fields!!");
							setErrorMessage(Messages[3]); // Fill all the fields!!
							return;
						}

						if (!PasswordRegex.test(AuthRef.current[3].value)) {
							console.warn("Not valid Password!!");
							setErrorMessage(Messages[2]); // Not valid Password!!
							return;
						}

						const UserData = {
							FirstName: AuthRef.current[0].value,
							LastName: AuthRef.current[1].value,
							Username: AuthRef.current[2].value,
							Password: AuthRef.current[3].value,
						};
						console.warn(UserData);
						Authentication("SignUp", UserData);
					}}
					className={`${
						Loading && "!bg-green-500/70 cursor-not-allowed"
					} w-[100px] mx-1 h-[40px] bg-green-500 rounded-md flex justify-center items-center cursor-pointer hover:bg-green-500/70`}>
					Sign Up{" "}
					<i
						className={`${
							Loading
								? "fas fa-circle-notch animate-spin ml-2"
								: "fas fa-chevron-right"
						} ml-1`}
						aria-hidden="true"></i>{" "}
				</div>
			</div>
			<div>
				<p onClick={() => Navigate("/")} className="inline text-sm hover:border-b cursor-pointer hover:text-white/70">
					Home
				</p>{" "}
				|<p className="text-sm inline"> Already have a account ?</p>
				<p
					onClick={() => {
						setAuthData({
							Username: "",
							Password: "",
							FirstName: "",
							LastName: "",
						});
						setErrorMessage("");
						setAuthMode("SignIn");
						Navigate("/signin");
					}}
					className="group text-sm pl-1 items-center inline-flex hover:border-b hover:animate-pulse cursor-pointer">
					Sign In{" "}
					<i className="fas fa-arrow-right-long pl-1 text-sm group-hover:text-green-500"></i>
				</p>
			</div>
		</div>
	);
};

export default SignupComponent;
