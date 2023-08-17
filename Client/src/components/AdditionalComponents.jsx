import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../Modules/axios";

import AuthContext from "../Authentication/Components/AuthContext";
import Convert2Dict from "../Modules/Utility";

export function TokenRefresh(Request, Method="GET", Payload={}, Params={}){
	
	return new Promise((myresolve,myreject) => {

		const Parameters = {...Params, UserID : localStorage.getItem("UserID")}
		
		if (Method === "POST"){
			axios.post(Request, Payload, {
				headers : {
					"Content-Type" : "application/json",
					"X-CSRF-TOKEN" : Convert2Dict(document.cookie)["csrf_access_token"]
				},
				params : Parameters
			}).then((res) => {
				myresolve(res)
			}).catch((error) => {
				axios.get("/refresh").then(() => 
				{
					try {
						axios.post(Request, Payload, {
							headers : {
								"Content-Type" : "application/json",
								"X-CSRF-TOKEN" : Convert2Dict(document.cookie)["csrf_access_token"]
							},
							params : Parameters
						}).then((res) => {
							myresolve(res)
						})
					} catch (error) {
						if (error.code === "ERR_NETWORK" || error.code === "ECONNABORTED"){
							myreject({
								Status: true,
								Type: 500
							})
						} else if (error.response.status === 401) {
							myreject({
								Status: true,
								Type: 401
							})
						}
					}
				}).catch((error) => {
					if (error.code === "ERR_NETWORK" || error.code === "ECONNABORTED"){
						myreject({
							Status: true,
							Type: 500
						})
					} else if (error.response.status === 401) {
						myreject({
							Status: true,
							Type: 401
						})
					}
				})
			})
		} 
		
		else {
			axios.get(Request,{
				params : Parameters
			}).then((res) => {
				myresolve(res)
			}).catch((error) => {
				axios.get("/refresh").then((res) => 
				{
					console.warn("Refresh Done")
					try {
						axios.get(Request,{
							params : Parameters
						}).then((res) => {
							myresolve(res)
						})
					} catch (error) {
						if (error.code === "ERR_NETWORK" || error.code === "ECONNABORTED"){
							myreject({
								Status: true,
								Type: 500
							})
						} else if (error.response.status === 401) {
							myreject({
								Status: true,
								Type: 401
							})
						}
					}
				}).catch((error) => {
					if (error.code === "ERR_NETWORK" || error.code === "ECONNABORTED"){
						myreject({
							Status: true,
							Type: 500
						})
					} else if (error.response.status === 401) {
						myreject({
							Status: true,
							Type: 401
						})
					}
				})
			})
		}
	})
}

export function DeleteTaskModal({UndoTask, DeleteLoading}) {
	return (
	<div className="fixed w-full h-[60px] bottom-1 z-[90] p-2 right-0 cursor-pointer">
		<div className="bg-primary w-full border border-red-500 h-[50px] p-5 rounded-md flex items-center justify-between ">
			<p className="text-lg">Task Deleted</p>
			<button onClick={UndoTask} disabled={DeleteLoading} className="flex items-center text-base hover:animate-pulse hover:text-green-400"> 
				<i className={`${DeleteLoading ? "fas fa-circle-notch animate-spin text-green-400" : "fas fa-arrow-rotate-left"} px-1`} aria-hidden="true"></i> Undo
			</button>
		</div>
	</div>
)}

export function ErrorModal({ErrorType}) {
	const {setAuthstate, GuestMode, setGuestMode} = useContext(AuthContext)
	const Navigate = useNavigate()

	function SignOut(){
		
		if (!GuestMode) {
			axios.get("/signout").then((res) => {
				console.log(res.data)
				if (res.status == 200){
					localStorage.setItem("Authstate", false)
					localStorage.setItem("UserID","")
					localStorage.setItem("SessionDuration","")
					
					setAuthstate(false)
					Navigate("/")
				}
			})

		} else {
			setGuestMode(false)
			Navigate("/")
		}
	}

	if (ErrorType === 500){
		return (
			<div className="bg-primary p-10 flex flex-col rounded-md border my-5">
				<div>
					<b>Something's Wrong !!</b>
				</div>
				<div>
					Try Again Later or Click here
					<i // THis for refreshing the page
						onClick={() => location.reload()}
						className="fas fa-arrow-rotate-right px-1 cursor-pointer hover:text-green-300 hover:animate-pulse"
						aria-hidden="true"></i>
					to refresh
				</div>
			</div>
		);
	}

	else if (ErrorType === 401){
		const [RemainingTime, setRemainingTime] = useState(5)
		
		useEffect(() => {
			const Interval = setInterval(() => {
				setRemainingTime((prev) => {
					if (RemainingTime != 0){
						return prev - 1
					} else {
						clearInterval(Interval)
					}
				})
			},[1000])

			return () => {
				clearInterval(Interval);
			};
		},[])

		useEffect(() => {
			if (RemainingTime === 0){
				SignOut()
			}
		},[RemainingTime])
		
		return (
			<div className="bg-primary p-10 flex flex-col rounded-md border my-5">
				<div>
					<b>Session Expired !!</b>
				</div>
				<div>
					Please Re-Authenticate by Clicking here
					<i // THis for refreshing the page
						onClick={SignOut}
						className="fas fas fa-power-off px-1 cursor-pointer hover:text-red-300 hover:animate-pulse"
						aria-hidden="true"></i>
					or Automatically in <span className="animate-pulse">{RemainingTime}</span> Seconds
				</div>
			</div>
		);
	}

	if (ErrorType === 503){
		return (
			<div className="bg-primary p-10 flex flex-col rounded-md border my-5">
				<div>
					<b>No Internet Connection !!</b>
				</div>
				<div>
					Try Again Later or Click here
					<i // THis for refreshing the page
						onClick={() => location.reload()}
						className="fas fa-arrow-rotate-right px-1 cursor-pointer hover:text-green-300 hover:animate-pulse"
						aria-hidden="true"></i>
					to refresh
				</div>
			</div>
		);
	}
}

export function TaskOptions({DeleteLoading, setCurrentColor, CustomClass, setEditTask, setEditTaskValue, item, setEditCheckBoxTask, setCheckListItems, index, DeleteTask }) {
	return (
		<div className={`${CustomClass} hidden m-[-40px] group-hover:flex flex-col items-center justify-around text-background bg-white w-10`}>
			<button>
				<i
					onClick={() => {
						if (item.Type === "CheckList"){
							setEditTask(true); // This is to set the EditTask state to true to open the editting page
							setEditCheckBoxTask(true)
							setCheckListItems({
								...(JSON.parse(JSON.stringify(item))),
								Index: index,
								OriginalItem: JSON.parse(JSON.stringify(item)),
							})
							setCurrentColor(item.Color)
						} else {
							// This is to set the EditTask state to true to open the editting page
							setEditTask(true); // The EditTaskValue state is used to store the Original, Modified as well as the Index of the item in the form of Dict

							setEditTaskValue({
								OriginalItem: JSON.parse(JSON.stringify(item)),
								ModifiedItem: JSON.parse(JSON.stringify(item)),
								Index: index,
							});
							setCurrentColor(item.Color)
						}
					}}
					className="fas fa-pen p-1 hover:text-orange-400"></i>
			</button>
			<button disabled={DeleteLoading}>
				<i
					onClick={() => DeleteTask(item)}
					className={`${DeleteLoading ? "fas fa-circle-notch animate-spin text-red-500" : "fas fa-trash"} p-1 hover:text-red-500`}></i>
			</button>
		</div>
	);
}

export function HeaderComponent(){
	const Navigate = useNavigate()

	return (
		<div onClick={() => {
			Navigate("/")
		}} className="cursor-pointer">
			<p className="text-8xl max-sm:text-7xl font-Shadows_Into_Light">Will Do</p>
			<div className="h-1" />
				<p className="text-base underline underline-offset-2 max-sm:text-sm decoration-yellow-400">
					Where Simplicity Meets Success!
				</p>
			<div />
		</div>
	)
}
