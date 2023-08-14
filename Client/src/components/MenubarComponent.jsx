import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "../Modules/axios";

import AuthContext from "../Authentication/Components/AuthContext";
import { useNavigate } from "react-router-dom";
import { toInteger } from "lodash";
import { TokenRefresh } from "./AdditionalComponents";

export function MenubarComponent({ setMenuBarStatus, setTrashPage, TrashPage }) {
	const { setAuthstate, setResetPassword } = useContext(AuthContext);
	const [Settings, setSettings] = useState(false);

	const [SessionSettings, setSessionSettings] = useState(false)
	const [SessionDuration, setSessionDuration] = useState(toInteger(localStorage.getItem("SessionDuration")));
	const SessionDurationRef = useRef();

	const NumberRegex = /^(?:\d{1,6})$/  

	let Navigate = useNavigate();

	// useEffect(() => {
	// 	if (SessionDuration > 30) {
	// 		setSessionDuration(30);
	// 	} else if (SessionDuration < 1) {
	// 		setSessionDuration(1);
	// 	}
	// });

	function SignOut(Redirect) {
		axios.get("/signout").then((res) => {
			console.log(res.data);
			if (res.status == 200) {
				localStorage.setItem("Authstate", false);
				localStorage.setItem("UserID", "");
				localStorage.setItem("SessionDuration", "");
				setAuthstate(false);
				Navigate(Redirect);
			}
		});
	}
 
	return (
		<>
			<div
				onClick={() => {
					setMenuBarStatus(false);
					setSettings(false);
				}}
				className="fixed w-[100vw] h-[100vh] left-0 top-0 z-[100] bg-primary/50 backdrop-blur-sm"></div>
			{Settings ? (
				<div className="fixed left-0 top-0 h-[100vh] w-[350px] max-sm:w-[330px] p-5 z-[110] border-r-2 bg-primary flex flex-col">
					<div className="w-full">
						<i
							onClick={() => {
								setSettings(false);
							}}
							className="fas fa-arrow-right-to-bracket rotate-180 text-2xl text-white/50
						hover:text-white/100 float-right m-2"
							aria-hidden="true"></i>
					</div>
					
					{SessionSettings ? (
						<div>
							
							<p className="text-left px-3">Session Duration (Days)</p>
							<div className="flex p-3">
								<input
									onChange={(e) => {
										if (!NumberRegex.test(e.target.value)){
											return
										}
										setSessionDuration(
											toInteger(e.target.value)
										);
									}}
									value={SessionDuration}
									className="bg-black/90 h-[35px] w-full rounded-md text-white p-1 mr-1"
								/>
								<button
									disabled={SessionDuration == 30}
									onClick={() => {
										if (SessionDuration > 1) {
											setSessionDuration(1);
										}
										setSessionDuration(SessionDuration + 1);
									}}
									className={`${SessionDuration == 30 && "cursor-not-allowed bg-secondary/50"} flex items-center justify-center bg-secondary hover:bg-secondary/70 rounded-md px-2 mx-1`}>
									<i className="fas fa-plus"></i>
								</button>
								<button
									disabled={SessionDuration == 1}
									onClick={() => {
										if (SessionDuration > 1) {
											setSessionDuration(1);
										}
										setSessionDuration(SessionDuration - 1);
									}}
									className={`${SessionDuration == 1 && "cursor-not-allowed bg-secondary/50"} flex items-center justify-center bg-secondary hover:bg-secondary/70 rounded-md px-2 mx-1`}>
									<i className="fas fa-minus"></i>
								</button>
								<div className="w-0.5 mx-1 my-2 bg-secondary"/>
								<button
									onClick={() => {
										setSessionSettings(false);
										(async () => {
											await TokenRefresh("/settings","POST",{
												SessionDuration : SessionDuration
											}).then((res) => console.log(res.data))
										})()
									}}
									className={`flex items-center justify-center bg-secondary hover:bg-green-500 rounded-md px-2 mx-1`}>
									<p className="px-2">Save</p>
								</button>
							</div>
							<div className="h-0.5 my-2 bg-secondary"/>
						</div>
					) : (
						<button onClick={() => {setSessionSettings(true)}} className="p-3 bg-secondary m-2 rounded-md hover:bg-secondary/50">
							Session Duration
						</button>
					)}

					<button
						onClick={() => {
							SignOut("/reset")
							setResetPassword(true);
						}}
						className="p-3 bg-secondary m-2 rounded-md hover:bg-red-500">
						Reset Password
					</button>
					<div className="h-0.5 my-2 bg-secondary"/>
				</div>
			) : (
				<div className="fixed left-0 top-0 h-[100vh] w-[350px] max-sm:w-[330px] p-5 z-[110] border-r-2 bg-primary flex flex-col">
					<div className="w-full">
						<button className="float-right">
							<i
								onClick={() => {
									setMenuBarStatus(false);
								}}
								className="fas fa-arrow-right-to-bracket rotate-180 text-2xl text-white/50
							hover:text-white/100 p-2"
								aria-hidden="true"></i>
						</button>
					</div>
					{!TrashPage ? (
						<button onClick={() => {
							setTrashPage(true)
						}} className="p-3 bg-secondary m-2 rounded-md hover:bg-secondary/50">
							Trash
						</button>
					) : (
						<button onClick={() => {
							setTrashPage(false)
						}} className="p-3 bg-secondary m-2 rounded-md hover:bg-secondary/50">
							Tasks
						</button>
					)}
					<button
						onClick={() => setSettings(true)}
						className="p-3 bg-secondary m-2 rounded-md hover:bg-secondary/50">
						Settings
					</button>
					<div className="h-0.5 my-2 bg-secondary"/>
					<button
						onClick={() => {
							SignOut("/")
						}}
						className="p-3 bg-secondary m-2 rounded-md hover:bg-red-500 mt-auto">
						Sign out
					</button>
				</div>
			)}
		</>
	);
}
