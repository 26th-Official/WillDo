import React, { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../Modules/axios";

import { HeaderComponent } from "../../Components/AdditionalComponents";
import AuthContext from "./AuthContext";

const SignInComponent = ({setUserID}) => {
	const {setAuthstate} = useContext(AuthContext)

	const [AuthData, setAuthData] = useState({
		Username: "",
		Password: "",
	});

	const Messages = [
		"",
		"Incorrect Username or Password",
		"Please Enter a Valid Password",
		"Please enter all the Fields",
	];
	const [ErrorMessage, setErrorMessage] = useState(Messages[0]); // 👆

	const [Loading, setLoading] = useState(false);

	const AuthRef = useRef([]);

	const Navigate = useNavigate()

	const PasswordRegex =
		/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%&*?])[A-Za-z\d!@#$%^&*?]{8,}$/;

	function Authentication(UserData) {
		// This is to sign in the user
		setLoading(true);
		axios.post("/signin", UserData).then((res) => {
			setLoading(false);
			console.log(res.data);
			setUserID(res["data"]["UserID"])

			localStorage.setItem("UserID",res["data"]["UserID"])
			localStorage.setItem("SessionDuration",res["data"]["SessionDuration"])
			
			console.warn("Successfully Signed In!!");

			setAuthData({
				Username: "",
				Password: "",
			});
			setAuthstate(true)
			Navigate("/tasks",{replace:true});
		}).catch((error) => {
			if (error["response"].status === 404 || error["response"].status === 401) {
				setLoading(false);
				console.warn("Incorrect Username or Password");
				setErrorMessage(Messages[1]); // "Incorrect Username or Password"
			}
			 
		})
	}

	function KeyPress(e,Index) {
        // This is to move to next textfield when enter is pressed
        if (e.key === "Enter"){
            e.preventDefault(); // This is to prevent the default behaviour of the enter key which is to move to next line
            AuthRef.current[Index].focus()
        }

    }

	return (
		<div className="flex flex-col items-center">
			<HeaderComponent />
			<div className="h-4" />
			<div
				className={`bg-primary p-5 w-[350px]  max-sm:w-[300px] flex flex-col items-center rounded-md border my-5`}>
				{ErrorMessage !== "" && (
					<div className="w-full">
						<div className="flex items-center rounded-md p-2 bg-red-500">
							<p className="text-left">{ErrorMessage}</p>
						</div>
						<br />
					</div>
				)}
				<div className="w-full">
					<p className="text-left text-md">Username</p>
					<input
						id="Username_Field"
						ref={(el) => (AuthRef.current[0] = el)}
						onKeyDown={(e) => KeyPress(e, 1)}
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
						required
						autoFocus
						placeholder="Please Enter your Username"
						className="bg-black/90 min-h-[24px] w-full rounded-md text-white p-1 my-2"
					/>
					<div className="h-3" />

					<p className="text-left text-md">Password</p>
					<input
						id="Password_Field"
						ref={(el) => (AuthRef.current[1] = el)}
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
				<button
					onClick={() => {
						setErrorMessage(Messages[0]);

						if (
							AuthRef.current[0].value === "" ||
							AuthRef.current[1].value === ""
						) {
							for (let i = 0; i < AuthRef.current.length; i++) {
								if (AuthRef.current[i].value === "") {
									AuthRef.current[i].style.outline =
										"0.7px solid rgb(239,68,68)";
								}
							}

							console.warn("Fill all the fields!!");
							setErrorMessage(Messages[3]);
						}

						if (!PasswordRegex.test(AuthRef.current[1].value)) {
							console.warn("Not valid Password!!");
							setErrorMessage(Messages[2]);
						}

						const UserData = {
							Username: AuthRef.current[0].value,
							Password: AuthRef.current[1].value,
						};
						Authentication(UserData);
					}}

					disabled={Loading}
					className={`${
						Loading && "!bg-green-500/70 cursor-not-allowed"
					} w-[100px] mx-1 h-[40px] bg-green-500 rounded-md flex justify-center items-center cursor-pointer hover:bg-green-500/70`}>
					Sign In{" "}
					<i
						className={`${
							Loading
								? "fas fa-circle-notch animate-spin ml-2"
								: "fas fa-chevron-right"
						} ml-1`}
						aria-hidden="true"></i>{" "}
				</button>
			</div>
		</div>
	);
};

export default SignInComponent;
