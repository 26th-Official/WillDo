import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "../Modules/axios";
import Convert2Dict from "../Modules/Utility"

// for realtime data fetching from backend
import io from "socket.io-client";

import { omit, isEqual, set } from "lodash";

import { HuePicker } from 'react-color';

// Custom Components
import { DeleteTaskModal, ErrorModal, TaskOptions } from './AdditionalComponents';
import { MenubarComponent } from './MenubarComponent';
import { NavbarComponent } from "./NavbarComponent";
import AuthContext from "../Authentication/Components/AuthContext";

// **********************************************************************************************

export const TaskComponent = () => {
	// =======================================================
	const [isInternet,setisInternet] = useState(navigator.onLine)
	// =======================================================
	const { UserID } = useContext(AuthContext)
	// =======================================================
	// let access_token = document.cookie.split(";").find((item) => item.startsWith("access_token")).split("=")[1]
	// to store the tasks from db
	const [Tasks, setTasks] = useState([]);

	// its for displaying the div for typing new tasks
	const [AddTask, setAddTask] = useState(false);
	// This is to tell if the Add task button is clicked and to should display the loading animation
	const [isAddTaskLoading, setisAddTaskLoading] = useState(false);
	// =======================================================

	const [ColorPickerState, setColorPickerState] = useState(false)
	const [CurrentColor, setCurrentColor] = useState("#232323")
	
	// =======================================================
	// to check is the tasks are fetched for first time or else display the loading animation
	const [Fetched, setFetched] = useState(false);
	// when the db update signal received from backend it triggers the useeffect to fetch the data from db
	const [Refetch, setRefetch] = useState(true);
	// =======================================================

	// =======================================================
	// its for displaying the div for typing new checkbox type tasks (Its the button in the add task page to add checkbox type tasks)
	const [AddCheckBoxTask, setAddCheckBoxTask] = useState(false);
	
	const [EditCheckBoxTask, setEditCheckBoxTask] = useState(false);
	
	// This stores the Items inside the "Checklist" type tasks
	const [CheckListItems, setCheckListItems] = useState([{Heading: "",Checked: false}]);
	// =======================================================

	// =======================================================
	// its for displaying the div for editting tasks
	const [EditTask, setEditTask] = useState(false);
	// This is to store the contents of the task that is being edited (It stores the whole json of that particular task)
	const [EditTaskValue, setEditTaskValue] = useState()
	// =======================================================

	// =======================================================
	// It stores the single task that was deleted recently for the purpose of undo
	const [DeletedTasks, setDeletedTasks] = useState([])
	// It indicates whether the delete modal is visible or not
	const [DeleteModelStatus, setDeleteModelStatus] = useState(false)
	// It stores the interval for the delete modal, We are storing it because we want to clear the interval when the undo action is performed
	// if we don't clear the Interval it will automatically the Delete Modal with the remaining time the next time we delete a task
	const [DeleteModalInterval, setDeleteModalInterval] = useState()
	// =======================================================

	// =======================================================
	// It indicates whether the menu bar is visible or not
	const [MenuBarStatus, setMenuBarStatus] = useState(false) 
	// =======================================================

	// This is for the error modal it will be "true" ("Status") is there is any error and "Type" will be the error code
	const DefaultError = {
		Status: false,
		Type: 0
	}
	const [Error, setError] = useState(DefaultError)

	// =======================================================

	// **********************************************************************************************

	// for the text in the new task div
	const AddTaskRef = useRef("");

	// It contains all the items for the checklist type tasks mainly used inorder to highlight the 
	// the textbox which are empty
	const CheckListTaskRef = useRef([])

	// **********************************************************************************************

	// ? =======================================================

	useEffect(() => {
		if (Tasks.length === 0 && !navigator.onLine){
			setError({
				Status: true,
				Type: 503
			})
		}
		else if (Tasks.length === 0 && navigator.onLine){
			setError(DefaultError)
			setRefetch(true)	
		}
	},[isInternet])

	// ? =======================================================
	// To check if the user's internet is online or offline
	useEffect(() => {
		window.addEventListener("online",(() => {
			setisInternet(true)
			console.log(`Internet Connection is ${navigator.onLine ? "Online" : "Offline"}`)
		}))
		window.addEventListener("offline",(() => {
			setisInternet(false)
			console.log(`Internet Connection is ${navigator.onLine ? "Online" : "Offline"}`)
		}))

		return () => {
			window.removeEventListener("online",(() => {setisInternet(true)}))
			window.removeEventListener("offline",(() => {setisInternet(false)}))
		}
	},[])

	// ? =======================================================
	
	// for fetching the data from db for first time and as well as when updated
	useEffect(() => {
		if (Refetch) {

			(async () => {
				await TokenRefresh("/fetch").then((res) => 
				{	
					res = res["data"]["Data"]
					if(!isEqual(Tasks,res)){
						setTasks(res)
					}
					setFetched(true);
					setRefetch(false);
					setError(DefaultError)

				}).catch((error) => {
					if (error.status === 401){
						setError({
							Status: true,
							Type: 401
						})
						console.error(error)
					} else {
						setError({
							Status: true,
							Type: 500
						})
						console.error(error)
					}
				})
			})()

			// axios.get("/fetch").then((res) => (res.data).Data).then((res) => 
			// 	{
			// 		// This is to check if the data is changed or not so as to not cause latency issues
			// 		if(!isEqual(Tasks,res)){
			// 			setTasks(res)
			// 		}
			// 		setFetched(true);
			// 		setRefetch(false);

			// 	}).catch((error) => {
			// 		console.clear()
			// 		if (error.response.status === 401){
			// 			axios.get("/refresh").then(() => {
			// 				axios.get("/fetch").then((res) => ((res.data).Message).Data).then((res) => 
			// 					{
			// 						// This is to check if the data is changed or not so as to not cause latency issues
			// 						if(!isEqual(Tasks,res)){
			// 							setTasks(res)
			// 						}
			// 						setFetched(true);
			// 						setRefetch(false);
			// 					})
			// 					.catch((error) => {
			// 						setFetched(true)
			// 						setError(true)
			// 					});
			// 			}).catch(() => {
			// 				setFetched(true)
			// 				setError(true)
			// 			})
			// 		}
			// 	});
		}
	}, [Refetch]);

	// ? =======================================================

	// for receiving signal from backend if there is a db update and control the refetch state
	// useEffect(() => {
	// 	const socketio = io("/");

	// 	socketio.on("DB_Update", () => {
	// 		console.log("Update has been Made");
	// 		setRefetch(true);
	// 	});

	// 	return () => {
	// 		socketio.disconnect();
	// 	};
	// });


	// ? =======================================================

	// This is to control the delete modal visibility
	useEffect(() => {
		// if the "DeleteModelStatus" is true we set the Interval for 10 seconds and then set the "DeleteModelStatus" to false
		if (DeleteModelStatus){
			const Interval = setInterval(() => {
				setDeleteModelStatus(false)
			},10000)
			// We are storing the interval so that we can clear it when the undo action is performed
			setDeleteModalInterval(Interval)
		}

		return () => {
			// This is to clear the interval when the undo action is performed
			clearInterval(DeleteModalInterval)
		}
	},[DeleteModelStatus])

	// ? =======================================================

	// This is to turn the Checklist type task to normal text task when all the items in the
	// checklist are removed
	useEffect(() => {
		// 👇 Check if "CheckListItems" is empty
		if (CheckListItems.length === 0){
			setAddCheckBoxTask(false) // Switching this to false which will turn the checklist type task to normal text task in the UI
			setCheckListItems([[{Heading: "",Checked: false}]]) // for displaying a new textbox for the next time after removing all the items in the checklist
		}
	},[CheckListItems])

	// ? =======================================================

	// This is to close the color picker when the "EditTask" or "AddTask" is false 
	// and also to set the "CurrentColor" to default (#232323)
	useEffect(() => {
		if (!EditTask && !AddTask){
			setColorPickerState(false)
			setCurrentColor("#232323")
		}

	},[EditTask,AddTask])

	// ? =======================================================

	// **********************************************************************************************

	function TokenRefresh(Request, Method="GET", Payload={}){
		return new Promise((myresolve,myreject) => {

			const Parameters = { UserID : UserID}
			
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
					axios.get("/refresh").then(() => {
						console.warn("Refresh Done")
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
							if (error.response.status === 401){
								myreject(error.response)
							}
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
					axios.get("/refresh").then((res) => {
						console.warn("Refresh Done")
						try {
							axios.get(Request,{
								params : Parameters
							}).then((res) => {
								myresolve(res)
							})
						} catch (error) {
							myreject(error)
						}
					}).catch((error) => {
						if (error.response.status === 401){
							myreject(error.response)
						}
					})
				})
			}
		})
	}

	// **********************************************************************************************

	// This is for submitting the task after typing the in the Add task div
	// when clicked it first adds the task locally and then when task update signal received from the
	// backend the whole data is refetched so as to not have any latency issues
	function SubmitTask() {

		// This will handle the checklist type tasks
		// "AddCheckBoxTask" is true when the user clicks the "Add Checklist" button in the add task div else its a normal text task
		if (AddCheckBoxTask === false){
			const Heading = AddTaskRef.current.value;
			if (Heading === "") {
				AddTaskRef.current.focus();
				AddTaskRef.current.style.outline = "0.7px solid rgb(239,68,68)";
				setisAddTaskLoading(false)
			} else {
				AddTaskRef.current.style.outline = "none";

				(async () => {
					await TokenRefresh("/new","POST",{
						Heading: Heading,
						Color: CurrentColor
					}).then((res) => {

						console.log(res.data)

						setAddTask(false);
						setisAddTaskLoading(false)
						//  Adding the new task locally
						setTasks([
							...Tasks,
							{
								Heading: Heading,
								Color: CurrentColor,
								TaskID: res["data"].TaskID
							},
						])
					})
					.catch((error) => {
						if (error.status === 401){
							setError({
								Status: true,
								Type: 401
							})
							console.error(error)
						} else {
							setError({
								Status: true,
								Type: 500
							})
							console.error(error)
						}
					})
				})()

				// axios.post("/new",{
				// 	Heading: Heading,
				// 	Color: CurrentColor
				// },{
				// 	headers : {
				// 		"X-CSRF-TOKEN" : (document.cookie).split(";")[0].split("=")[1]
				// 	},
				// }).then((res) => console.log(res.data))

				;
			}
		} 
		// This will handle the checklist type tasks
		else {
			let CheckListCount = 0 // This will count the number of checklist items that are not empty
			let UpdatedCheckListItems = [...CheckListItems] // This will make a deep copy of the checklist items array
			for (let i=0;i<CheckListItems.length;i++){
				//  👇 This denotes the textbox inside the "CheckListTaskRef" as it has 3 childrens
				if (CheckListTaskRef.current[i].children[1].value === ""){
					CheckListTaskRef.current[i].children[1].focus()
					CheckListTaskRef.current[i].children[1].style.outline = "0.7px solid rgb(239,68,68)"; // This will highlight the textbox which is empty
					setisAddTaskLoading(false)
				} else {
					CheckListCount += 1 // If the textbox is not empty we increment the count
					CheckListTaskRef.current[i].children[1].style.outline = "none" // we remove the outline if the textbox is not empty
					// 👇 we add the Checkbox data from the 2nd child of the "CheckListTaskRef" which is the "input checkbox"
					UpdatedCheckListItems[i].Checked = CheckListTaskRef.current[i].children[0].checked 
				}
			}
			
			// If all the checklist items are not empty then we add the task to the db and locally
			if (CheckListCount === CheckListItems.length){
				console.log({
					Contents: CheckListItems,
					Type: "CheckList",
					Color: CurrentColor
				});

				(async () => {
					await TokenRefresh("/new","POST",{
						Contents: CheckListItems,
						Type: "CheckList",
						Color: CurrentColor
					}).then((res) => {

						console.log(res.data)

						setAddTask(false);
						setisAddTaskLoading(false)
						setCheckListItems([{Heading: "",Checked: false}])
						setAddCheckBoxTask(false)

						//  Adding the new task locally
						setTasks([
							...Tasks,
							{	
								Contents: CheckListItems, // We are adding the checklist items to the "Contents" key
								Type: "CheckList",
								Color: CurrentColor,
								TaskID: res["data"].TaskID
							},
						]);


					})
					.catch((error) => {
						if (error.status === 401){
							setError({
								Status: true,
								Type: 401
							})
							console.error(error)
						} else {
							setError({
								Status: true,
								Type: 500
							})
							console.error(error)
						}
					})
				})()
				
				// axios.post("/new",{
				// 	Contents: CheckListItems,
				// 	Type: "CheckList",
				// 	Color: CurrentColor
				// },{
				// 	headers : {
				// 		"X-CSRF-TOKEN" : (document.cookie).split(";")[0].split("=")[1]
				// 	},
				// }).then((res) => console.log(res.data))

				
			
			}

		}

	}

	// **********************************************************************************************

	// This is to delete the task from the DB
	function DeleteTask(data) {

		(async () => {
			await TokenRefresh("/delete","POST",data)
			.then((res) => console.log(res.data))
			.catch((error) => {
				if (error.status === 401){
					setError({
						Status: true,
						Type: 401
					})
					console.error(error)
				} else {
					setError({
						Status: true,
						Type: 500
					})
					console.error(error)
				}
			})
		})()

		// axios.post("/delete",data,{
		// 	headers : {
		// 		"X-CSRF-TOKEN" : (document.cookie).split(";")[0].split("=")[1]
		// 	},
		// }).then((res) => console.log(res.data))

		// After deleting, inorder for fast update we are removing the item from the
		// "Tasks" state as well so we don't have to wait for the backend to trigger a update
		const NewTaskList = Tasks.filter((item) => item !== data);
		setTasks(NewTaskList);
		setDeletedTasks([data]);
		setDeleteModelStatus(true)
	}

	// This is to undo the last delete action
	function UndoTask(){

		(async () => {
			await TokenRefresh("/new","POST",{
				...(DeletedTasks[0])
			}).then((res) => console.log(res.data))
			.catch((error) => {
				if (error.status === 401){
					setError({
						Status: true,
						Type: 401
					})
					console.error(error)
				} else {
					setError({
						Status: true,
						Type: 500
					})
					console.error(error)
				}
			})
		})()

		// axios.post("/new",{
		// 	Heading: DeletedTasks[0].Heading,
		// },{
		// 	headers : {
		// 		"X-CSRF-TOKEN" : (document.cookie).split(";")[0].split("=")[1]
		// 	},
		// }).then((res) => console.log(res.data))

		setTasks((prev) => [...prev,DeletedTasks[0]])
		setDeleteModelStatus(false)
		clearInterval(DeleteModalInterval) // When undo action is performed the timer is cleared so as to not interfere the next delete action
	}

	// **********************************************************************************************
	// This is to update the task in the DB
	// It takes the modified item and the original item as those are needed in order to update the mongodb
	function UpdateTask(ModifiedItem, OriginalItem, index) {

		(async () => {
			await TokenRefresh("/update","POST",{
				OriginalItem: OriginalItem,
				ModifiedItem: ModifiedItem,
			}).then((res) => console.log(res.data))
			.catch((error) => {
				if (error.status === 401){
					setError({
						Status: true,
						Type: 401
					})
					console.error(error)
				} else {
					setError({
						Status: true,
						Type: 500
					})
					console.error(error)
				}
			})
		})()

		// axios.post("/update",{
		// 	OriginalItem: OriginalItem,
		// 	ModifiedItem: ModifiedItem,
		// },{
		// 	headers : {
		// 		"X-CSRF-TOKEN" : (document.cookie).split(";")[0].split("=")[1]
		// 	},
		// }).then((res) => console.log(res.data))

		// After updating, inorder for fast update we are updating the item from the
		// "Tasks" state as well so we don't have to wait for the backend to trigger a update

		const TasksCopy = JSON.parse(JSON.stringify(Tasks)); // We are making a deep copy of the Tasks state as don't want to share the same memory location
		TasksCopy[index] = ModifiedItem; // Now we are updating the TasksCopy with the modified item
		console.warn(TasksCopy)
		setTasks([...TasksCopy]); // Now we are updating the Tasks state with the updated TasksCopy
	}

	// **********************************************************************************************

	function TaskDisplay({item, index, UpdateTask, setEditTask, setEditTaskValue, DeleteTask, setCurrentColor}) {
		if (item.Type === "CheckList") {
			return (
				<div className="flex group">
					<TaskOptions setCurrentColor={setCurrentColor} setEditCheckBoxTask={setEditCheckBoxTask} setCheckListItems={setCheckListItems} CustomClass={"sm:!hidden mr-auto"} setEditTask={setEditTask} setEditTaskValue={setEditTaskValue} item={item} UpdateTask={UpdateTask} index={index} DeleteTask={DeleteTask} />
					<div className="flex-1 group-hover:max-sm:ml-5">
						{item.Contents.map((subitem, subindex) => <div key={subindex} className="flex">
								<div onClick={() => {
										const UpdatedCheckListItems = JSON.parse(JSON.stringify(item));
										UpdatedCheckListItems.Contents[subindex].Checked = !UpdatedCheckListItems.Contents[subindex].Checked;
										UpdateTask(UpdatedCheckListItems, {TaskID : item["TaskID"]}, index);
									}} className={`shrink-0 w-[13.5px] h-[13.5px] mt-[5px] mr-2 border border-secondary/70 bg-blue-500 rounded-sm flex items-center justify-center ${subitem.Checked === false && "!bg-white"}`}>
									<i className={`fa fa-check text-white text-[10px] pt-[1.5px] hidden ${subitem.Checked === true && "!block"}`} aria-hidden="true"></i>
								</div>
								<p className={`${subitem.Checked && "line-through brightness-50"} text-left`}>{subitem.Heading}</p>
							</div>
						)}
					</div>
					<TaskOptions setCurrentColor={setCurrentColor} setEditCheckBoxTask={setEditCheckBoxTask} setCheckListItems={setCheckListItems} CustomClass={"max-sm:!hidden ml-auto"} setEditTask={setEditTask} setEditTaskValue={setEditTaskValue} item={item} UpdateTask={UpdateTask} index={index} DeleteTask={DeleteTask} />
				</div>
			)
		} else {
			return (
				<div className="flex justify-center">
					<TaskOptions setCurrentColor={setCurrentColor} setEditCheckBoxTask={setEditCheckBoxTask} setCheckListItems={setCheckListItems} CustomClass={"sm:!hidden mr-auto"} setEditTask={setEditTask} setEditTaskValue={setEditTaskValue} item={item} UpdateTask={UpdateTask} index={index} DeleteTask={DeleteTask} />
					<p className="flex-1">{item.Heading}</p>
					<TaskOptions setCurrentColor={setCurrentColor} setEditCheckBoxTask={setEditCheckBoxTask} setCheckListItems={setCheckListItems} CustomClass={"max-sm:!hidden ml-auto"} setEditTask={setEditTask} setEditTaskValue={setEditTaskValue} item={item} UpdateTask={UpdateTask} index={index} DeleteTask={DeleteTask} />
				</div>
			)
		}	
    }

	// **********************************************************************************************

	return (
		<div className="relative">
			{/* +++++++++++++++++++++++++++++++++++++++++++++++++ Nav Bar +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}

			<NavbarComponent setMenuBarStatus={setMenuBarStatus} setAddTask={setAddTask}  />

			{/* +++++++++++++++++++++++++++++++++++++++++++++++++ Menu Bar +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}

			{MenuBarStatus && (
				<MenubarComponent setMenuBarStatus={setMenuBarStatus}  />
			)}

			{/* +++++++++++++++++++++++++++++++++++++++++++++++++ Mobile Task Add Button +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}

			<div className="fixed bottom-6 right-6 z-[50] sm:hidden">
				<i onClick={() => {
						setAddTask(true)
				}} className="fa fa-plus-circle text-4xl" aria-hidden="true"></i>
			</div>

			{/* +++++++++++++++++++++++++++++++++++++++++++++++++ Task Delete Modal +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
			
			{DeleteModelStatus && (
				<DeleteTaskModal  UndoTask={UndoTask}  />
			)}

			{/* +++++++++++++++++++++++++++++++++++++++++++++++++ Task's Area +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}

			{/* THis is where the fetched tasks are displayed */}
			<div className="absolute top-[50px] w-full">
				{/* this is New task adding part located */}

				{/* +++++++++++++++++++++++++++++++++++++++++++++++++ Task Adding Page +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}

				{AddTask && (
					<div style={{backgroundColor : CurrentColor}} className={`bg-primary p-10 flex flex-col rounded-md border my-5`}>
						{/* This is for the Normal text tasks */}
						{!AddCheckBoxTask? (
							<textarea
							onInput={() => {
								AddTaskRef.current.style.outline =
									"0.7px solid rgb(255,255,255)";
								AddTaskRef.current.style.height = "auto";
								AddTaskRef.current.style.height =
									AddTaskRef.current.scrollHeight + "px";
							}}
							autoFocus
							required
							placeholder="Please Enter a Task"
							ref={AddTaskRef}
							rows={1}
							className="bg-black/90 min-h-[24px] rounded-md text-white p-1"></textarea>
						) : (
							// This is for the checklist type tasks
							<div>
								{CheckListItems.map((item,index) => (
									<div ref={(el) => CheckListTaskRef.current[index] = el} key={index} className="flex items-center my-2">
										<input className="w-3.5 h-3.5 mx-2" type="checkbox"/>
										<textarea 
										autoFocus
										// We are setting the value of the textarea to the "Heading" property of the item in the "CheckListItems" state
										value={item.Heading}
										onKeyDown={(e) => {
											// This is to add a new checklist item when the user presses the enter key
											if (e.key === "Enter"){
												e.preventDefault(); // This is to prevent the default behaviour of the enter key which is to move to next line
												const UpdatedCheckListItems = [...CheckListItems,{}]
												setCheckListItems(UpdatedCheckListItems)
											}
										}}
										// Since we are setting the "Value" property of the textarea its not editable now, 
										// so we are using the "onChange" event to update the "Heading" property of the item in the "CheckListItems" state
										onChange={(e) => {
											const UpdatedCheckListItems = [...CheckListItems]
											UpdatedCheckListItems[index].Heading = e.target.value // This sets the current text value the dict
											setCheckListItems(UpdatedCheckListItems)
										}}	
										placeholder="Please Enter a Task" 
										className="mx-2 bg-black/80 min-h-[24px] w-full rounded-md text-white p-1"
										rows="1"></textarea>
										{/* This is to delete a particular check list item */}
										<i onClick={() => {
											const UpdatedCheckListItems = CheckListItems.filter((item,ind) => ind !== index) // This will remove the item from the "CheckListItems" state which has the same index as the "index" parameter
											setCheckListItems(UpdatedCheckListItems)
										}} className="fas fa-xmark text-sm text-white/50
											hover:text-white/100" aria-hidden="true"></i>
									</div>
								))}
								{/* This will add new item to the checklist */}
								<p onClick={() => {
									const UpdatedCheckListItems = [...CheckListItems,{}]
									setCheckListItems(UpdatedCheckListItems)
								}} className="cursor-pointer float-left underline underline-offset-2 text-sm pl-9 pt-2 text-white/50
								hover:text-white/100"> <i className="fa fa-plus text-xs px-1" aria-hidden="true"></i>Add Item</p>
							</div>
						)}
						<br />
						<div className="flex mx-auto">
							<div onClick={() => {setColorPickerState(!ColorPickerState)}} className="w-[35px] mx-1 h-[40px] bg-secondary rounded-md flex justify-center items-center cursor-pointer hover:bg-white group">
								<img width={"25px"} src="/color_picker.png"/>
							</div>
							<button
								// This is to add the task to the database
								disabled={isAddTaskLoading}
								onClick={(e) => {
									console.warn("Yessss")
									SubmitTask()
									setisAddTaskLoading(true)
								}}
								className={`${isAddTaskLoading && "!bg-green-500/70 cursor-not-allowed"} w-[100px] mx-1 h-[40px] bg-secondary rounded-md flex justify-center items-center cursor-pointer hover:bg-green-500`}>
								Add Task{" "}
								{isAddTaskLoading ? (
									<i
									className={`${
										isAddTaskLoading
											? "fas fa-circle-notch animate-spin ml-2"
											: "fas fa-chevron-right"
									} ml-1`}
									aria-hidden="true"></i>
								) : (
									<i
									className="fas fa-chevron-right pl-1"
									aria-hidden="true"></i>
								)}
								
								
							</button>
							<button
								// THis is to cancel the task adding process
								onClick={() => {
									setAddTask(false)
									// 👇 This is to reset the checklist items when the user cancels the task adding process
									setCheckListItems([{Heading: "",Checked: false}])
									setAddCheckBoxTask(false)
								}}
								className="w-[100px] mx-1 h-[40px] bg-secondary rounded-md flex justify-center items-center cursor-pointer hover:bg-red-500">
								Cancel{" "}
								<i
									className="fas fa-xmark pl-1"
									aria-hidden="true"></i>{" "}
							</button>
							{/* This is responsible for switching between the Normal text task and checklist task */}
							{!AddCheckBoxTask ? (
								<div onClick={() =>{
									setAddCheckBoxTask(true)
								}} className="w-[35px] mx-1 h-[40px] bg-secondary rounded-md flex justify-center items-center cursor-pointer hover:bg-indigo-500">
									<div className="border-[2px] rounded-md">
										<i className="fas fa-check text-xs px-1.5"></i>
									</div>
								</div>
							) : (
								<div onClick={() =>{
									setAddCheckBoxTask(false)
								}} className="w-[35px] mx-1 h-[40px] bg-secondary rounded-md flex justify-center items-center cursor-pointer hover:bg-indigo-500">
									<div className="border-[2px] rounded-md">
										<i className="fas fa-i font-light text-xs px-1.5"></i>
									</div>
								</div>
							)}
						</div>
						<br />
						{ColorPickerState && (
							<div className="flex items-center space-x-3 mx-auto">
								<div className="bg-secondary px-2 py-1 pb-0.5 rounded-md group">
									<i onClick={() => {setCurrentColor("#232323")}} className="fas fa-ban text-white/50 group-hover:text-white/100"></i>
								</div>
								<HuePicker color={CurrentColor} onChange={(color) => {
									setCurrentColor(color.hex)
								}}/>
							</div>
						)}
					</div>
				)}

				{/* +++++++++++++++++++++++++++++++++++++++++++++++++ Task Editing Page +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}

				{EditTask && (
					<div style={{backgroundColor : CurrentColor}} className={`bg-primary p-10 flex flex-col rounded-md border my-5`}>
						{EditCheckBoxTask ? (
							<div className="flex flex-col">
								<div>
									{(CheckListItems.Contents).map((item,index) => (
										<div ref={(el) => CheckListTaskRef.current[index] = el} key={index} className="flex items-center my-2">
											<input onChange={() =>{
												const UpdatedCheckListItems = {...CheckListItems, Contents :[...CheckListItems.Contents]}
												UpdatedCheckListItems.Contents[index].Checked = !item.Checked // This will toggle the "Checked" property of the item in the "CheckListItems" state
												setCheckListItems(UpdatedCheckListItems)
											}} checked={item.Checked} className="w-3.5 h-3.5 mx-2" type="checkbox"/>
											<textarea 
											autoFocus
											// We are setting the value of the textarea to the "Heading" property of the item in the "CheckListItems" state
											value={item.Heading}
											onKeyDown={(e) => {
												// This is to add a new checklist item when the user presses the enter key
												if (e.key === "Enter"){
													e.preventDefault(); // This is to prevent the default behaviour of the enter key which is to move to next line
													const UpdatedCheckListItems = [...CheckListItems,{Heading: "",Checked: false}]
													setCheckListItems(UpdatedCheckListItems)
												}
											}}
											// Since we are setting the "Value" property of the textarea its not editable now, 
											// so we are using the "onChange" event to update the "Heading" property of the item in the "CheckListItems" state
											onChange={(e) => {
												const UpdatedCheckListItems = {...CheckListItems, Contents :[...CheckListItems.Contents]}
												UpdatedCheckListItems.Contents[index].Heading = e.target.value // This sets the current text value the dict
												setCheckListItems(UpdatedCheckListItems)
											}}	
											placeholder="Please Enter a Task" 
											className="mx-2 bg-black/80 min-h-[24px] w-full rounded-md text-white p-1"
											rows="1"></textarea>
											{/* This is to delete a particular check list item */}
											<i onClick={() => {
												const UpdatedCheckListItems = {...CheckListItems, Contents :(CheckListItems.Contents).filter((item,ind) => ind !== index)} // This will remove the item from the "CheckListItems" state which has the same index as the "index" parameter
												setCheckListItems(UpdatedCheckListItems)
											}} className="fas fa-xmark text-sm text-white/50
												hover:text-white/100" aria-hidden="true"></i>
										</div>
									))}
									<p onClick={() => {
										const UpdatedCheckListItems = {...CheckListItems, Contents :[...CheckListItems.Contents,{Heading: "",Checked: false}]}
										setCheckListItems(UpdatedCheckListItems)
									}} className="cursor-pointer float-left underline underline-offset-2 text-sm pl-9 pt-2 text-white/50
									hover:text-white/100"> <i className="fa fa-plus text-xs px-1" aria-hidden="true"></i>Add Item</p>

								</div>
								{/* This will add new item to the checklist */}
								
								<br />
								<div className="flex mx-auto">
									<div onClick={() => {setColorPickerState(!ColorPickerState)}} className="w-[35px] mx-1 h-[40px] bg-secondary rounded-md flex justify-center items-center cursor-pointer hover:bg-white group">
										<img width={"25px"} src="/color_picker.png"/>
									</div>
									<div
										onClick={() => {											
											// We are sending the ModifiedItem, OriginalItem and the Index to the UpdateTask function
											CheckListItems.Color = CurrentColor
											console.warn(CheckListItems)
											UpdateTask(omit(CheckListItems,"Index","OriginalItem"), {TaskID : CheckListItems["OriginalItem"].TaskID}, CheckListItems.Index)
											// After updating the task we are setting the EditTask state to false to close the editing page
											setEditTask(false)
											setEditCheckBoxTask(false)
											setCheckListItems([[{Heading: "",Checked: false}]])
										}}
										className="w-[100px] mx-1 h-[40px] bg-secondary rounded-md flex justify-center items-center cursor-pointer hover:bg-green-500">
										Confirm{" "}
										<i
											className="fas fa-chevron-right pl-1"
											aria-hidden="true"></i>{" "}
									</div>
									<div
										// THis is to cancel the task editting process
										onClick={() => {
											setEditTask(false)
											setEditCheckBoxTask(false)
											setCheckListItems([[{Heading: "",Checked: false}]])
										}}
										className="w-[100px] mx-1 h-[40px] bg-secondary rounded-md flex justify-center items-center cursor-pointer hover:bg-red-500">
										Cancel{" "}
										<i
											className="fas fa-xmark pl-1"
											aria-hidden="true"></i>{" "}
									</div>
								</div>
								<br />
								{ColorPickerState && (
									<div className="flex items-center space-x-3 mx-auto">
										<div className="bg-secondary px-2 py-1 pb-0.5 rounded-md group">
											<i onClick={() => {setCurrentColor("#232323")}} className="fas fa-ban text-white/50 group-hover:text-white/100"></i>
										</div>
										<HuePicker color={CurrentColor} onChange={(color) => {
											setCurrentColor(color.hex)
										}}/>
									</div>
								)}
							</div>
						) : (
							<div className="flex flex-col">
								<textarea
									onInput={() => {
										AddTaskRef.current.style.outline =
											"0.7px solid rgb(255,255,255)";
										AddTaskRef.current.style.height = "auto";
										AddTaskRef.current.style.height =
											AddTaskRef.current.scrollHeight + "px";
									}}
									autoFocus
									required
									placeholder="Please Enter a Task"
									ref={AddTaskRef}
									value={(EditTaskValue.ModifiedItem).Heading} // This is to set the value of the textbox to the value that needs to be edited
									// Now we are using the onChange event to update the value of the textbox as its not possible to edit the value of the textbox,
									// since we have used the "value" attribute to set the value of the textbox
									onChange={(text) => {
										let TextboxText = text.target.value // This is to get the value of the textbox
										const ModifiedItem = { ...(EditTaskValue.ModifiedItem) } // This is to copy the ModifiedItem object from the EditTaskValue state
										ModifiedItem.Heading = TextboxText // Now we are updating the ModifiedItem's Heading with the new value which is from the textbox
		
										// After updating the ModifiedItem's Heading we are updating the EditTaskValue state with the new ModifiedItem
										setEditTaskValue({
											OriginalItem: EditTaskValue.OriginalItem,
											ModifiedItem: ModifiedItem,
											Index: EditTaskValue.Index
										})
		
									}}
									rows={1}
									className="bg-black/90 min-h-[24px] rounded-md text-white p-1"></textarea>
								<br />
								<div className="flex mx-auto">
									<div onClick={() => {setColorPickerState(!ColorPickerState)}} className="w-[35px] mx-1 h-[40px] bg-secondary rounded-md flex justify-center items-center cursor-pointer hover:bg-white group">
										<img width={"25px"} src="/color_picker.png"/>
									</div>
									<div
										onClick={() => {
											EditTaskValue["ModifiedItem"].Color = CurrentColor
											// We are sending the ModifiedItem, OriginalItem and the Index to the UpdateTask function
											UpdateTask(EditTaskValue.ModifiedItem, {TaskID : EditTaskValue["OriginalItem"].TaskID}, EditTaskValue.Index)
											// After updating the task we are setting the EditTask state to false to close the editing page
											setEditTask(false)
										}}
										className="w-[100px] mx-1 h-[40px] bg-secondary rounded-md flex justify-center items-center cursor-pointer hover:bg-green-500">
										Confirm{" "}
										<i
											className="fas fa-chevron-right pl-1"
											aria-hidden="true"></i>{" "}
									</div>
									<div
										// THis is to cancel the task editting process
										onClick={() => {
											setEditTask(false)
										}}
										className="w-[100px] mx-1 h-[40px] bg-secondary rounded-md flex justify-center items-center cursor-pointer hover:bg-red-500">
										Cancel{" "}
										<i
											className="fas fa-xmark pl-1"
											aria-hidden="true"></i>{" "}
									</div>
								</div>
								<br />
								{ColorPickerState && (
									<div className="flex items-center space-x-3 mx-auto">
										<div className="bg-secondary px-2 py-1 pb-0.5 rounded-md group">
											<i onClick={() => {setCurrentColor("#232323")}} className="fas fa-ban text-white/50 group-hover:text-white/100"></i>
										</div>
										<HuePicker color={CurrentColor} onChange={(color) => {
											setCurrentColor(color.hex)
										}}/>
									</div>
								)}
							</div>
						)}
					</div>
				)}
				

				{/* +++++++++++++++++++++++++++++++++++++++++++ Error Page +++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}

				{/* The error page is displayed if there are anyproblem in fetching the tasks */}
				{Error.Status ? (
					<ErrorModal ErrorType={Error.Type} />
				) : (

					// +++++++++++++++++++++++++++++++++++++++++++++++++ Nothing Page and Loading Page +++++++++++++++++++++++++++++++++++++++++++++++++

					<div>
						{/* In here it first checks if the "Tasks" state has any content, */}
						{/* if it has it will displays it */}
						{Object.keys(Tasks).length === 0 ? (
							<>
								{/* If the "Tasks" state is empty, it checks if the "Fetched state is false or true" */}
								{/* If it false it shows the loading animation else it assumes that there is no */}
								{/* task in the database */}
								{Fetched ? (
									<div className="bg-primary p-10 flex flex-col rounded-md border my-5">
										<div>
											<b>Nothing Here !!</b>
										</div>
										<div>
											Add Some by Clicking the{" "}
											<i
												className="fa fa-plus-circle px-1"
												aria-hidden="true"></i>
											👆
										</div>
									</div>
								) : (
									<i
										className="fas fa-arrows-rotate text-2xl text-white/50 m-5 animate-spin"
										aria-hidden="true"></i>
								)}
							</>
						) : (
							// This accesses the contents in the fetched json data
							<>
								<div className="p-5" />  {/* This is to add some space between the nav bar and the tasks */}
								{/* ++++++++++++++++++++++++++++++++++++++++ Pinned Tasks ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
								{Tasks.map((item, index) => 
									<div key={index} style={{backgroundColor: item.Color}} className="group relative overflow-hidden bg-primary p-10 flex flex-col rounded-md border my-5">
										<TaskDisplay item={item} index={index} setCurrentColor={setCurrentColor} UpdateTask={UpdateTask} setEditTask={setEditTask} setEditTaskValue={setEditTaskValue} DeleteTask={DeleteTask}  />
									</div>
								)}

							</>
						)}
					</div>
				)}
			</div>
		</div>
	);

    
  };