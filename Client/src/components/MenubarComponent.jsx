import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "../Modules/axios";

import AuthContext from "../Authentication/Components/AuthContext";
import { useNavigate } from "react-router-dom";
import { toInteger } from "lodash";

export function MenubarComponent({setMenuBarStatus}) {
	const {Authstate, setAuthstate} = useContext(AuthContext)
	const [Settings, setSettings] = useState(false)
	const [SessionDuration, setSessionDuration] = useState(1)
	const SessionDurationRef = useRef()

	let Navigate = useNavigate()

	useEffect(() => {
		
	})


	function SignOut(){
		axios.get("/signout").then((res) => {
			console.log(res.data)
			if (res.status == 200){
				localStorage.setItem("Authstate", false)
				setAuthstate(false)
				Navigate("/")
			}
		})
	}

	return (
	<>
		<div onClick={() => {
			setMenuBarStatus(false)
			setSettings(false)
		}} className="fixed w-[100vw] h-[100vh] left-0 top-0 z-[100] bg-primary/50 backdrop-blur-sm"></div>
		{Settings ? (
			<div className="fixed left-0 top-0 h-[100vh] w-[40%] max-sm:w-[80%] p-5 z-[110] border-r-2 bg-primary flex flex-col">
				<div className="w-full">
					<i onClick={() => {
						setSettings(false)
					}} className="fas fa-arrow-right-to-bracket rotate-180 text-2xl text-white/50
						hover:text-white/100 float-right m-2" aria-hidden="true"></i>
				</div>
				<div className="text-left">
					<p className="text-left font-bold text-xl">Settings</p>
					<div className="h-4"/>
					<p className="inline">Session Duration (Days)</p>
					<div className="h-3"/>
					<div className="flex">
						<input onChange={(e) => {
							setSessionDuration(toInteger(e.target.value))
						}} onBlur={(e) => {
							if (e.target.value === "" || e.target.value < 1){
								setSessionDuration(1)
							}
						}} value={SessionDuration} type="number" className="bg-black/90 h-[35px] w-full rounded-md text-white p-1 mr-1" />
						<button onClick={() => {
							if (SessionDuration > 1){
								setSessionDuration(1)
							}
							setSessionDuration(SessionDuration + 1)
						}} className="flex items-center justify-center bg-secondary hover:bg-secondary/70 rounded-md px-2 mx-1"><i className="fas fa-plus"></i></button>
						<button onClick={() => {
							if (SessionDuration > 1){
								setSessionDuration(1)
							}
							setSessionDuration(SessionDuration - 1)
						}} className="flex items-center justify-center bg-secondary hover:bg-secondary/70 rounded-md px-2 mx-1"><i className="fas fa-minus"></i></button>
					</div>
				</div>
			</div>
		) : (
			<div className="fixed left-0 top-0 h-[100vh] w-[40%] max-sm:w-[80%] p-5 z-[110] border-r-2 bg-primary flex flex-col">
				<div className="w-full">
					<button className="float-right">
						<i onClick={() => {
							setMenuBarStatus(false);
						}} className="fas fa-arrow-right-to-bracket rotate-180 text-2xl text-white/50
							hover:text-white/100 p-2" aria-hidden="true"></i>
					</button>
				</div>
				<button className="p-3 bg-secondary m-2 rounded-md hover:bg-secondary/50">Trash</button>			
				<button onClick={() => setSettings(true)} className="p-3 bg-secondary m-2 rounded-md hover:bg-secondary/50">Settings</button>
				<button onClick={SignOut} className="p-3 bg-secondary m-2 rounded-md hover:bg-red-500 mt-auto">Sign out</button>
			</div>
		)}
	</>
)}
