import React , {useRef, useState} from 'react'

export const AuthComponent = () => {
    
    const [AuthState, setAuthState] = useState("None")
    const AuthRef = useRef([])

    function KeyPress(e,Index) {
        // This is to move to next textfield when enter is pressed
        if (e.key === "Enter"){
            e.preventDefault(); // This is to prevent the default behaviour of the enter key which is to move to next line
            AuthRef.current[Index].focus()
        }

    }

    function SignInComponent(){
        return (
            <div
                className={`bg-primary p-5 w-[350px] flex flex-col items-center rounded-md border my-5`}>
                <div className='w-full'>
                    <p className='text-left text-md'>Username</p>    
                    <input
                        ref={(el) => AuthRef.current[0] = el}
                        onKeyDown={(e) => KeyPress(e,1)}
                        autoFocus
                        required
                        placeholder="Please Enter your Username"
                        className="bg-black/90 min-h-[24px] w-full rounded-md text-white p-1 my-2"
                    />
                    <div className='h-3' />
                    <p className='text-left text-md'>Password</p>
                    <input
                        ref={(el) => AuthRef.current[1] = el}
                        required
                        placeholder="Please Enter your Password"
                        className="bg-black/90 min-h-[24px] w-full rounded-md text-white p-1 my-2"
                        type="password"
                    />
                </div>
                <br />
                <div
                    // This is to add the task to the database
                    onClick={() => {
                        SubmitTask()
                    }}
                    className="w-[100px] mx-1 h-[40px] bg-green-500 rounded-md flex justify-center items-center cursor-pointer hover:bg-green-500/70">
                    Sign In{" "}
                    <i
                        className="fas fa-chevron-right pl-1"
                        aria-hidden="true"></i>{" "}
                </div>
            </div>
        )
    }

    function SignUpComponent(){
        return (
            <div
                className={`bg-primary p-5 w-[350px] flex flex-col items-center rounded-md border my-5`}>
                <div className='w-full'>
                    <p className='text-left text-md'>First Name</p>    
                    <input
                        ref={(el) => AuthRef.current[0] = el}
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
                        onKeyDown={(e) => KeyPress(e,2)}
                        required
                        placeholder="Please Enter your Last name"
                        className="bg-black/90 min-h-[24px] w-full rounded-md text-white p-1 my-2"
                    />
                    <div className='h-3' />
                    <p className='text-left text-md'>Username</p>    
                    <input
                        ref={(el) => AuthRef.current[2] = el}
                        onKeyDown={(e) => KeyPress(e,3)}
                        required
                        placeholder="Please Enter your Username"
                        className="bg-black/90 min-h-[24px] w-full rounded-md text-white p-1 my-2"
                    />
                    <div className='h-3' />
                    <p className='text-left text-md'>Password</p>
                    <input
                        ref={(el) => AuthRef.current[3] = el}
                        required
                        placeholder="Please Enter your Password"
                        className="bg-black/90 min-h-[24px] w-full rounded-md text-white p-1 my-2"
                        type="password"
                    />
                </div>
                <br />
                <div
                    // This is to add the task to the database
                    onClick={() => {
                        SubmitTask()
                    }}
                    className="w-[100px] mx-1 h-[40px] bg-green-500 rounded-md flex justify-center items-center cursor-pointer hover:bg-green-500/70">
                    Sign Up{" "}
                    <i
                        className="fas fa-chevron-right pl-1"
                        aria-hidden="true"></i>{" "}
                </div>
            </div>
        )
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
							className="bg-primary border-[0.5px] w-[200px] my-4 p-2 rounded-md hover:bg-blue-600">
							Sign In
						</p>
						<p
							onClick={() => {
								setAuthState("SignUp");
							}}
							className="bg-primary border-[0.5px] w-[200px] my-4 p-2 rounded-md hover:bg-yellow-400">
							Sign Up
						</p>
					</div>
				)}

                {/* ======================================================== */}

				{AuthState === "SignIn" && (
					<SignInComponent/>
				)}

                {/* ======================================================== */}

                {AuthState === "SignUp" && (
					<SignUpComponent/>
				)}
			</div>
		</>
	);
}
