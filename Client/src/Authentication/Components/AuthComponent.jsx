import React , {useRef, useState} from 'react'

export const AuthComponent = () => {
    
    const [AuthState, setAuthState] = useState("None") // "None" , "SignIn" , "SignUp"
    const Messages = ["","Username already exists!", "Incorrect Username or Password"]
    const [ErrorMessage, setErrorMessage] = useState(Messages[0]) // 👆
    const [Loading, setLoading] = useState(false)

    const [AuthData, setAuthData] = useState({})

    const AuthRef = useRef([])

    function KeyPress(e,Index) {
        // This is to move to next textfield when enter is pressed
        if (e.key === "Enter"){
            e.preventDefault(); // This is to prevent the default behaviour of the enter key which is to move to next line
            AuthRef.current[Index].focus()
        }

    }


    function Authentication(Action,UserData) {
        if (Action === "SignIn") {
            // This is to sign in the user
            setLoading(true)
            fetch("http://localhost:6565/signin", {
                method : "POST",
                headers : {"Content-Type" : "application/json"},
                body : JSON.stringify(UserData),
            }).then((res) => res.json()).then((data) => {
                if (data[1] === 404 || data[1] === 401){
                    setLoading(false)
                    setErrorMessage(Messages[2]) // "Incorrect Username or Password"
                }
            })
            console.log("Signing In")
            
        } else if (Action === "SignUp") {
            // This is to sign up the user
            setLoading(true)
            fetch("http://localhost:6565/signup", {
                method : "POST",
                headers : {"Content-Type" : "application/json"},
                body : JSON.stringify(UserData),
            }).then((res) => res.json()).then((data) => {
                if (data[1] === 400){
                    setLoading(false)
                    setErrorMessage(Messages[1]) // "Username already exists!"
                }
            })
            console.log("Signing Up")
        }
    }

    return (
		<>
			<div className="fixed w-full top-0 right-0 left px-2 z-[100] py-5 bg-background/50 backdrop-blur-sm ">
				<p className="font-Shadows_Into_Light text-6xl max-sm:text-5xl">
					Task I Will Do
				</p>
			</div>

            {/* ======================================================== */}

			<div className="absolute top-[50px] w-full p-10 flex flex-col items-center">
				{AuthState === "None" && (
					<div>
						<p
							onClick={() => {
								setAuthState("SignIn");
							}}
							className="bg-primary border-[0.5px] w-[200px] my-4 p-2 rounded-md hover:bg-blue-600 cursor-pointer">
							Sign In
						</p>
						<p
							onClick={() => {
								setAuthState("SignUp");
							}}
							className="bg-primary border-[0.5px] w-[200px] my-4 p-2 rounded-md hover:bg-yellow-400 cursor-pointer">
							Sign Up
						</p>
					</div>
				)}

                {/* ======================================================== */}

				{AuthState === "SignIn" && (
					<div  className='flex flex-col items-center'>
                        <div
                            className={`bg-primary p-5 w-[350px] flex flex-col items-center rounded-md border my-5`}>
                            {ErrorMessage !== "" && (
                                <div className='w-full'>
                                    <div className='flex items-center rounded-md p-2 bg-red-500'>
                                        <p className='text-left'>{ErrorMessage}</p>
                                    </div>
                                    <br />
                                </div>
                            )}
                            <div className='w-full'>
                                <p className='text-left text-md'>Username</p>    
                                <input
                                    ref={(el) => AuthRef.current[0] = el}
                                    onKeyDown={(e) => KeyPress(e,1)}
                                    value={AuthData !== {} && AuthData.Username}
                                    onChange={() => setAuthData({...AuthData, Username : AuthRef.current[0].value})}
                                    required
                                    autoFocus
                                    placeholder="Please Enter your Username"
                                    className="bg-black/90 min-h-[24px] w-full rounded-md text-white p-1 my-2"
                                />
                                <div className='h-3' />
                                <p className='text-left text-md'>Password</p>
                                <input
                                    ref={(el) => AuthRef.current[1] = el}
                                    value={AuthData !== {} && AuthData.Password}
                                    onChange={() => setAuthData({...AuthData, Password : AuthRef.current[1].value})}
                                    required
                                    placeholder="Please Enter your Password"
                                    className="bg-black/90 min-h-[24px] w-full rounded-md text-white p-1 my-2"
                                    type="password"
                                />
                            </div>
                            <br />
                            <div
                                onClick={() => {
                                    setErrorMessage(Messages[0])
                                    const UserData = {
                                        Username : AuthRef.current[0].value,
                                        Password : AuthRef.current[1].value,
                                    }
                                    console.warn(UserData)
                                    Authentication("SignIn", UserData)
                                }}
                                className={`${Loading && "!bg-green-500/70 cursor-not-allowed"} w-[100px] mx-1 h-[40px] bg-green-500 rounded-md flex justify-center items-center cursor-pointer hover:bg-green-500/70`}>
                                Sign In{" "}
                                <i
                                    className={`${Loading ? "fas fa-circle-notch animate-spin ml-2" : "fas fa-chevron-right"} ml-1`}
                                    aria-hidden="true"></i>{" "}
                            </div>
                        </div>
                        <div>
                            <p onClick={() => setAuthState("None")} className='inline text-sm hover:border-b cursor-pointer hover:text-white/70'>Home</p> |
                            <p className='text-sm inline'> Don't have a account ?</p>
                            <p onClick={() => {
                                setAuthData({})
                                setErrorMessage("")
                                setAuthState("SignUp")
                            }} className='group text-sm pl-1 items-center inline-flex hover:border-b hover:animate-pulse cursor-pointer'>Sign Up <i className='fas fa-arrow-right-long pl-1 text-sm group-hover:text-green-500'></i></p>
                        </div>
                    </div>
				)}

                {/* ======================================================== */}

                {AuthState === "SignUp" && (
					<div className='flex flex-col items-center'>
                        <div
                            className={`bg-primary p-5 w-[350px] flex flex-col items-center rounded-md border my-5`}>
                            {ErrorMessage !== "" && (
                                <div className='w-full'>
                                    <div className='flex items-center rounded-md p-2 bg-red-500'>
                                        <p className='text-left'>{ErrorMessage}</p>
                                    </div>
                                    <br />
                                </div>
                            )}
                            <div className='w-full'>
                                <p className='text-left text-md'>First Name</p>    
                                <input
                                    ref={(el) => AuthRef.current[0] = el}
                                    value={AuthData !== {} && AuthData.FirstName}
                                    onChange={(e) => setAuthData({...AuthData, FirstName : e.target.value})}
                                    onKeyDown={(e) => KeyPress(e,1)}
                                    autoFocus
                                    required
                                    placeholder="Please Enter your First Name"
                                    className="bg-black/90 min-h-[24px] w-full rounded-md text-white p-1 my-2"
                                />
                                <div className='h-3' />
                                <p className='text-left text-md'>Last name</p>    
                                <input
                                    ref={(el) => AuthRef.current[1] = el}
                                    value={AuthData !== {} && AuthData.LastName}
                                    onChange={(e) => setAuthData({...AuthData, LastName : e.target.value})}
                                    onKeyDown={(e) => KeyPress(e,2)}
                                    required
                                    placeholder="Please Enter your Last name"
                                    className="bg-black/90 min-h-[24px] w-full rounded-md text-white p-1 my-2"
                                />
                                <div className='h-3' />
                                <p className='text-left text-md'>Username</p>    
                                <input
                                    ref={(el) => AuthRef.current[2] = el}
                                    value={AuthData !== {} && AuthData.Username}
                                    onChange={(e) => setAuthData({...AuthData, Username : e.target.value})}
                                    onKeyDown={(e) => KeyPress(e,3)}
                                    required
                                    placeholder="Please Enter your Username"
                                    className="bg-black/90 min-h-[24px] w-full rounded-md text-white p-1 my-2"
                                />
                                <div className='h-3' />
                                <p className='text-left text-md'>Password</p>
                                <input
                                    ref={(el) => AuthRef.current[3] = el}
                                    value={AuthData !== {} && AuthData.Password}
                                    onChange={(e) => setAuthData({...AuthData, Password : e.target.value})}
                                    required
                                    placeholder="Please Enter your Password"
                                    className="bg-black/90 min-h-[24px] w-full rounded-md text-white p-1 my-2"
                                    type="password"
                                />  
                            </div>
                            <br />
                            <div
                                onClick={() => {
                                    setErrorMessage(Messages[0])
                                    const UserData = {
                                        FirstName : AuthRef.current[0].value,
                                        LastName : AuthRef.current[1].value,
                                        Username : AuthRef.current[2].value,
                                        Password : AuthRef.current[3].value,
                                    }
                                    console.warn(UserData)
                                    Authentication("SignUp", UserData)
                                }}
                                className={`${Loading && "!bg-green-500/70 cursor-not-allowed"} w-[100px] mx-1 h-[40px] bg-green-500 rounded-md flex justify-center items-center cursor-pointer hover:bg-green-500/70`}>
                                Sign Up{" "}
                                <i
                                    className={`${Loading ? "fas fa-circle-notch animate-spin ml-2" : "fas fa-chevron-right"} ml-1`}
                                    aria-hidden="true"></i>{" "}
                            </div>
                        </div>
                        <div>
                            <p onClick={() => setAuthState("None")} className='inline text-sm hover:border-b cursor-pointer hover:text-white/70'>Home</p> |
                            <p className='text-sm inline'> Already have a account ?</p>
                            <p onClick={() => {
                                setAuthData({})
                                setErrorMessage("")
                                setAuthState("SignIn")
                            }} className='group text-sm pl-1 items-center inline-flex hover:border-b hover:animate-pulse cursor-pointer'>Sign In <i className='fas fa-arrow-right-long pl-1 text-sm group-hover:text-green-500'></i></p>
                        </div>
                    </div>
				)}
			</div>
		</>
	);
}
