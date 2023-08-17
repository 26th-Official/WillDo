import { useContext, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../../Modules/axios'

import { HeaderComponent } from '../../Components/AdditionalComponents'
import AuthContext from './AuthContext'

const ResetPasswordComponent = () => {
    const { UserID } = useContext(AuthContext)

    const [AuthData, setAuthData] = useState({
		CurrentPassword: "",
		NewPassword: "",
        ConfirmPassword: "",
	});

    const Messages = [
		"",
		"Both Passwords doesn't match",
		"Please Enter a Valid Password",
        "Current Password is Incorrect",
		"Please enter all the Fields",
        "Something went wrong! Try again later..."
	];
	const [ErrorMessage, setErrorMessage] = useState(Messages[0]); // 👆

    const [Loading, setLoading] = useState(false);

    const AuthRef = useRef([]);

	const Navigate = useNavigate()

    const PasswordRegex =
		/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%&*?])[A-Za-z\d!@#$%^&*?]{8,}$/;


    function KeyPress(e,Index) {
        // This is to move to next textfield when enter is pressed
        if (e.key === "Enter"){
            e.preventDefault(); // This is to prevent the default behaviour of the enter key which is to move to next line
            AuthRef.current[Index].focus()
        }

    }

    function Authentication(UserData) {

        setLoading(true);
        axios.post("/reset",UserData,{
            headers: {
            "Content-Type": "application/json",
            },
            params: { UserID : UserID}
        }).then((res) => {
            setLoading(false)
            console.log(res.data)
            console.warn("Successfully Reseted Password!!");

            setAuthData({
                CurrentPassword: "",
                NewPassword: "",
                ConfirmPassword: "",
            })

            Navigate("/signin")

        }).catch((error) => {
            if (error["response"].status === 401){
                setLoading(false)
                setErrorMessage(Messages[3]) // "Current Password is Incorrect",

            } else {
                setLoading(false)
			    setErrorMessage(Messages[5]) // "Something went wrong! Try again later..."
            }
        })
    }

    return (
        <div className="flex flex-col items-center">
            <HeaderComponent />
            <div className="h-4" />
            <div
                className={`bg-primary p-5 w-[350px]  max-sm:w-[300px] flex flex-col items-center rounded-md border my-5`}>
                {ErrorMessage != "" && (
                    <div className="w-full">
                        <div className="flex items-center rounded-md p-2 bg-red-500">
                            <p className="text-left">{ErrorMessage}</p>
                        </div>
                        <br />
                    </div>
                )}
                <div className="w-full">
                    <p className="text-left text-md">Current Password</p>
                    <input
                        id="CurrentPassword_Field"
                        ref={(el) => (AuthRef.current[0] = el)}
                        onKeyDown={(e) => KeyPress(e, 1)}
                        value={AuthData.CurrentPassword}
                        onChange={(e) =>
                            setAuthData({
                                ...AuthData,
                                CurrentPassword: e.target.value,
                            })
                        }

                        onFocus={(e) =>
                            (e.target.style.outline =
                                "0.7px solid rgba(255,255,255,1)")
                        }
                        onBlur={(e) => (e.target.style.outline = "none")}
                        required
                        autoFocus
                        placeholder="Please Enter your Current Password"
                        className="bg-black/90 min-h-[24px] w-full rounded-md text-white p-1 my-2"
                    />
                    <div className="h-3" />

                    <p className="text-left text-md">New Password</p>
                    <input
                        id="NewPassword_Field"
                        ref={(el) => (AuthRef.current[1] = el)}
                        onKeyDown={(e) => KeyPress(e, 2)}
                        value={AuthData.NewPassword}
                        onChange={(e) => {
                            setAuthData({
                                ...AuthData,
                                NewPassword: e.target.value,
                            })

                            if (PasswordRegex.test(e.target.value)){
                                e.target.style.outline = "0.7px solid rgb(34,197,94)"
                                setErrorMessage(Messages[0])
                            } else if (e.target.value === "") {
                                e.target.style.outline = "0.7px solid rgba(255,255,255,1)"
                                setErrorMessage(Messages[0])
                            } else if (!PasswordRegex.test(e.target.value)){
                                e.target.style.outline = "0.7px solid rgba(255,255,255,1)"
                            }
                        }}

                        onBlur={(e) => {
                            if (!PasswordRegex.test(e.target.value) && e.target.value != "" ) {
                                e.target.style.outline = "0.7px solid rgb(239,68,68)"
                                setErrorMessage(Messages[2])
                            } else if (PasswordRegex.test(e.target.value)) {
                                e.target.style.outline = "0.7px solid rgb(34,197,94)"
                            } else if (e.target.value === "") {
                                e.target.style.outline = "none"
                                setErrorMessage(Messages[0])
                            }
                        }}

                        onFocus={(e) => {
                            if (PasswordRegex.test(AuthData.NewPassword)){
                                e.target.style.outline = "0.7px solid rgb(34,197,94)"
                            } else {
                                e.target.style.outline = "0.7px solid rgba(255,255,255,1)"
                            }
                        }}

                        required
                        placeholder="Please Enter your New Password"
                        className="bg-black/90 min-h-[24px] w-full rounded-md text-white p-1 my-2"
                        type="password"
                    />
                    <div className="h-3" />

                    <p className="text-left text-md">Confirm Password</p>
                    <input
                        id="ConfirmPassword_Field"
                        ref={(el) => (AuthRef.current[2] = el)}
                        onKeyDown={(e) => KeyPress(e, 3)}
                        value={AuthData.ConfirmPassword}
                        onChange={(e) => {
                            setAuthData({
                                ...AuthData,
                                ConfirmPassword: e.target.value,
                            })

                            if (e.target.value === AuthData.NewPassword) {
                                e.target.style.outline = "0.7px solid rgb(34,197,94)"
                                setErrorMessage(Messages[0])
                            } else if (e.target.value === "") {
                                e.target.style.outline = "none"
                                setErrorMessage(Messages[0])
                            } else {
                                e.target.style.outline = "0.7px solid rgba(255,255,255,1)"
                            }
                        }}

                        onBlur={(e) => {
                            if (e.target.value != AuthData.NewPassword && e.target.value != "") {
                                e.target.style.outline = "0.7px solid rgb(239,68,68)"
                                setErrorMessage(Messages[1])
                            } else if (e.target.value === ""){
                                e.target.style.outline = "none"
                            }
                        }}

                        onFocus={(e) => {
                            if (e.target.value === AuthData.NewPassword){
                                e.target.style.outline = "0.7px solid rgb(34,197,94)"
                            } else {
                                e.target.style.outline = "0.7px solid rgba(255,255,255,1)"
                            }
                        }}
                        
                        required
                        placeholder="Please Confirm your New Password"
                        className="bg-black/90 min-h-[24px] w-full rounded-md text-white p-1 my-2"
                        type="password"
                    />
                </div>
                <div className="h-3" />
                <button
                    ref={(el) => (AuthRef.current[3] = el)}
                    onClick={() => {
                        setErrorMessage(Messages[0]);

                        if (
                            AuthRef.current[0].value === "" ||
                            AuthRef.current[1].value === "" || 
                            AuthRef.current[2].value === ""
                        ) {
                            for (let i = 0; i < AuthRef.current.length - 1; i++) {
                                if (AuthRef.current[i].value === "") {
                                    AuthRef.current[i].style.outline =
                                        "0.7px solid rgb(239,68,68)";
                                }
                            }

                            console.warn("Fill all the fields!!");
                            setErrorMessage(Messages[4]);
                        }

                        const UserData = {
                            CurrentPassword: AuthRef.current[0].value,
                            NewPassword: AuthRef.current[1].value,
                        };

                        Authentication(UserData);
                    }}

                    disabled={Loading}
                    className={`${
                        Loading && "!bg-green-500/70 cursor-not-allowed"
                    } w-[100px] mx-1 h-[40px] bg-green-500 rounded-md flex justify-center items-center cursor-pointer hover:bg-green-500/70`}>
                    Confirm{" "}
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
                <p className="text-sm inline"> Here by Mistake ? </p> |
                <p
                    onClick={() => {
                        Navigate("/");
                    }}
                    className="group text-sm pl-1 items-center inline-flex hover:border-b hover:animate-pulse cursor-pointer">
                    Home{" "}
                    <i className="fas fa-arrow-right-long pl-1 text-sm group-hover:text-green-500"></i>
                </p>
            </div>
        </div>
    )
}

export default ResetPasswordComponent