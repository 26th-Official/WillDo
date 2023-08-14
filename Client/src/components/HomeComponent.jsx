import React, {useContext} from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../Authentication/Components/AuthContext";
import axios from "../Modules/axios";

export default function HomeComponent() {
	const {Authstate, setAuthstate, setGuestMode, GuestMode} = useContext(AuthContext)

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

				<div className="h-8" />
				
				{!Authstate ? (
					<div className="flex-1">
						<div className=" flex items-center justify-center mx-auto flex-1 max-w-[500px] max-sm:w-[270px] max-md:w-[300px] max-lg:w-[300px]">
							<p onClick={() => {
								Navigate("/signup");
							}} className="bg-green-500 border-[0.5px] max-sm:text-xl mx-2 w-1/2 my-4 p-2 text-3xl rounded-md hover:bg-green-500/70 cursor-pointer">
								Sign Up
							</p>
							<p onClick={() => {
								Navigate("/signin")
							}} className="bg-orange-500 border-[0.5px] max-sm:text-xl mx-2 w-1/2 my-4 p-2 text-3xl rounded-md hover:bg-orange-500/70 cursor-pointer">
								Sign In
							</p>
						</div>
						<p onClick={() => {
							setGuestMode(true)
							if (localStorage.getItem("Tasks") === null){
								localStorage.setItem("Tasks", JSON.stringify([]))
								localStorage.setItem("DeletedTasks", JSON.stringify([]))
							}
							Navigate("/tasks")
						}} className="group text-sm pl-1 items-center inline-flex hover:border-b hover:animate-pulse cursor-pointer">
							Guest Mode{" "}
							<i className="fas fa-arrow-right-long pl-1 text-sm group-hover:text-yellow-400"></i>
						</p>
					</div>
				) : (
					<div className="flex-1">
						<div className=" flex items-center justify-center mx-auto flex-1 max-w-[500px] max-sm:w-[300px] max-md:w-[300px] max-lg:w-[300px]">
							<p onClick={() => {
								Navigate("/tasks");
							}} className="bg-blue-600 border-[0.5px] mx-2 w-1/2 my-4 p-2 text-3xl rounded-md hover:bg-blue-600/70 cursor-pointer">
								Tasks
							</p>
							<p onClick={() => {

								if (!GuestMode){
									axios.get("/signout").then((res) => {
										console.log(res.data);
										if (res.status == 200) {
											localStorage.setItem("Authstate", false);
											localStorage.setItem("UserID", "");
											localStorage.setItem("SessionDuration", "");
											setAuthstate(false);
											Navigate("/");
										}
									});
						
								} else {
									setGuestMode(false)
									Navigate("/")
								}
								
							}} className="bg-red-500 border-[0.5px] mx-2 w-1/2 my-4 p-2 text-3xl rounded-md hover:bg-red-500/70 cursor-pointer">
								Sign Out
							</p>
						</div>
						<p onClick={() => {
							setGuestMode(true)
							if (localStorage.getItem("Tasks") === null){
								localStorage.setItem("Tasks", JSON.stringify([]))
								localStorage.setItem("DeletedTasks", JSON.stringify([]))
							}
							Navigate("/tasks")
						}} className="group text-sm pl-1 items-center inline-flex hover:border-b hover:animate-pulse cursor-pointer">
							Guest Mode{" "}
							<i className="fas fa-arrow-right-long pl-1 text-sm group-hover:text-yellow-400"></i>
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
