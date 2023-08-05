import React from "react";
import { useNavigate } from "react-router-dom";

export function HomeComponent({setAuthMode}) {

	const Navigate = useNavigate()

	return (
		<div>
			<p className="text-8xl font-Shadows_Into_Light">Will Do</p>
			<div className="h-1" />
			<p className="text-base underline underline-offset-2 decoration-yellow-400">
				Where Simplicity Meets Success!
			</p>
			<div className="h-10" />
			<div className="flex items-center justify-center max-sm:block max-md:block max-lg:block">
				<div className="w-1/2 max-sm:w-full max-md:w-full max-lg:w-full p-5">
					<p className="text-justify text-lg">
						In the fast-paced world we live in, managing tasks
						efficiently is the key to unlocking your true potential.
						Introducing <b className="text-yellow-400">"WillDo"</b>,
						your ultimate task managing app designed to bring
						clarity, focus, and success to your daily endeavors. Say
						goodbye to overwhelm and hello to simplicity as WillDo
						empowers you to conquer your to-do list like never
						before.
					</p>
				</div>
				<div className="h-10" />
				<div className=" flex items-center justify-center mx-auto flex-1 max-w-[500px] max-sm:w-[300px] max-md:w-[300px] max-lg:w-[300px]">
					<p onClick={() => {
						setAuthMode("SignUp")
						Navigate("/signup");
					}} className="bg-green-500 border-[0.5px] animate-bounce hover:animate-none mx-2 w-1/2 my-4 p-2 text-3xl rounded-md hover:bg-green-500/70 cursor-pointer">
						Sign Up
					</p>
					<p onClick={() => {
						setAuthMode("SignIn")
						Navigate("/signin")
					}} className="bg-orange-500 border-[0.5px] animate-bounce hover:animate-none mx-2 w-1/2 my-4 p-2 text-3xl rounded-md hover:bg-orange-500/70 cursor-pointer">
						Sign In
					</p>
				</div>
			</div>
		</div>
	);
}
