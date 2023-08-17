import { useState, useRef } from "react";
import axios from "../../Modules/axios";
import { useNavigate } from "react-router-dom";

import { HeaderComponent } from "../../Components/AdditionalComponents";

const SignUpComponent = () => {
	
	const [AuthData, setAuthData] = useState({
		Email: "",
		Password: "",
		FirstName: "",
		LastName: "",
	});

    const Messages = [
		"",
		"User already exists!", 
		"Please Enter a Valid Password", 
		"Please enter all the Fields", 
		"Please Enter a valid Email ID !!", 
		"Something went wrong! Try again later..."
	]

	const [ErrorMessage, setErrorMessage] = useState(Messages[0]); // 👆

	const [Loading, setLoading] = useState(false);

	const AuthRef = useRef([]);

	const Navigate = useNavigate()

	const PasswordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%&*?])[A-Za-z\d!@#$%^&*?]{8,}$/;
	const EmailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;


    function Authentication(UserData) {
        // This is to sign up the user
        setLoading(true)
        axios.post("/signup",UserData).then((data) => 
        {
   
			setLoading(false)
			console.warn("Successfully Signed Up!!")
			setAuthData({
				Email : "",
				Password : "",
				FirstName : "",
				LastName : ""
			})
			Navigate("/signin")
        }).catch((error) => {
			if (error["response"].status === 409){
                setLoading(false)
                console.warn("User already exists!")
                setErrorMessage(Messages[1]) // "User already exists!"
            } else {
			setLoading(false)
			setErrorMessage(Messages[5]) // "Something went wrong! Try again later..."
			}
		})
    }

	function KeyPress(e,Index) {
        // This is to move to next textfield when enter is pressed
        if (e.key === "Enter"){
            e.preventDefault(); // This is to prevent the default behaviour of the enter key which is to move to next line
            AuthRef.current[Index].focus()
        } else if (e.key === "Enter" && Index === 1){
			e.preventDefault();
			document.getElementById("Signin_Button").click()
		}

	}


	return (
		<div className="flex flex-col items-center">
			<HeaderComponent />
			<div className="h-4" />
			<div
				className={`bg-primary p-5 w-[350px] flex flex-col items-center rounded-md border my-5`}>
				{ErrorMessage != "" && (
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
						value={AuthData != {} && AuthData.FirstName}
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
						value={AuthData != {} && AuthData.LastName}
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
					<p className="text-left text-md">Email</p>
					<input
						id="Email_Field"
						ref={(el) => (AuthRef.current[2] = el)}
						value={AuthData != {} && AuthData.Email}
						onChange={(e) =>
							setAuthData({
								...AuthData,
								Email: e.target.value,
							})
						}
						onFocus={(e) =>
							(e.target.style.outline =
								"0.7px solid rgba(255,255,255,1)")
						}
						onBlur={(e) => (e.target.style.outline = "none")}
						onKeyDown={(e) => KeyPress(e, 3)}
						required
						placeholder="Please Enter your Email ID"
						className="bg-black/90 min-h-[24px] w-full rounded-md text-white p-1 my-2"
					/>
					
					<div className="h-3" />
					<p className="text-left text-md">Password</p>
					<input
						id="Password_Field"
						ref={(el) => (AuthRef.current[3] = el)}
						value={AuthData != {} && AuthData.Password}
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
						onKeyDown={(e) => KeyPress(e, 4)}
						required
						placeholder="Please Enter your Password"
						className="bg-black/90 min-h-[24px] w-full rounded-md text-white p-1 my-2"
						type="password"
					/>
				</div>

				<div className="h-3" />
				<button
					ref={(el) => (AuthRef.current[4] = el)}
					onClick={() => {
						setErrorMessage(Messages[0]);
						if (
							AuthRef.current[0].value === "" ||
							AuthRef.current[1].value === "" ||
							AuthRef.current[2].value === "" ||
							AuthRef.current[3].value === ""
						) {
							for (let i = 0; i < AuthRef.current.length - 1; i++) {
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

						else if (!EmailRegex.test(AuthRef.current[2].value)) {
							console.warn("Not valid Email ID!!");
							setErrorMessage(Messages[4]); // Not valid Email!!
							return;
						}

						const UserData = {
							FirstName: AuthRef.current[0].value,
							LastName: AuthRef.current[1].value,
							Email: AuthRef.current[2].value,
							Password: AuthRef.current[3].value,
						};
						
						console.warn(UserData);
						Authentication(UserData);
					}}

					disabled={Loading}
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
				</button>
			</div>
			<div>
				<p onClick={() => Navigate("/")} className="inline text-sm hover:border-b cursor-pointer hover:text-white/70">
					Home
				</p>{" "}
				|<p className="text-sm inline"> Already have a account ?</p>
				<p
					onClick={() => {
						setAuthData({
							Email: "",
							Password: "",
							FirstName: "",
							LastName: "",
						});
						setErrorMessage("");
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

export default SignUpComponent
