// Importing the required modules

import React, { useEffect, useRef, useState } from "react";
// for realtime data fetching from backend
import io from "socket.io-client";

// **********************************************************************************************

export const TaskComponent = () => {
	// to store the tasks from db
	const [Tasks, setTasks] = useState([]);
	// to check is the tasks are fetched for first time or else display the loading animation
	const [Fetched, setFetched] = useState(false);
	// its for displaying the div for typing new tasks
	const [AddTask, setAddTask] = useState(false);
	// its for displaying the div for editting tasks
	const [EditTask, setEditTask] = useState(false);
	// when the db update signal received from backend it triggers the useeffect to fetch the data from db
	const [Refetch, setRefetch] = useState(true);

	// =======================================================
	// We are using separate hover states for Pinned and Unpinned Tasks (Check if the task is hovered or not) so as to not confict with Pinned and Unpinned Tasks
	// Since we are using Index as the key, we can't use the same hover state for both
	const [PinnedTaskHover, setPinnedTaskHover] = useState(-1); // for Hover state for Pinned Task  -1 means no task is hovered
	const [NonPinnedTaskHover, setNonPinnedTaskHover] = useState(-1); // for Hover state for UnPinned Task  -1 means no task is hovered
	// =======================================================

	// It stores the height of the task option div that is being hovered
	const [TaskOptionHeight, setTaskOptionHeight] = useState(0);
	// This is for the error page it will be "true" if there is any problem in data fetching from backend
	const [ErrorPage, setErrorPage] = useState(false);
	// This is to store the contents of the task that is being edited (It stores the whole json of that particular task)
	const [EditTaskValue, setEditTaskValue] = useState()

	// It stores the single task that was deleted recently
	const [DeletedTasks, setDeletedTasks] = useState([])
	// It indicates whether the delete modal is visible or not
	const [DeleteModelStatus, setDeleteModelStatus] = useState(false)

	// It stores the interval for the delete modal, We are storing it because we want to clear the interval when the undo action is performed
	// if we don't clear the Interval it will automatically the Delete Modal with the remaining time the next time we delete a task
	const [DeleteModalInterval, setDeleteModalInterval] = useState()

	// **********************************************************************************************

	// for the text in the new task div
	const AddTaskRef = useRef("");
	// It contains the all the div of tasks
	const TaskList = useRef([]);

	// **********************************************************************************************

	// for fetching the data from db for first time and as well as when updated
	useEffect(() => {
		if (Refetch) {
			fetch("http://localhost:6565/getall")
				.then((res) => res.json())
				.then((res) => {
					setTasks(res);
					setFetched(true);
					setRefetch(false);
				})
				.catch(() => setErrorPage(true));
		}
	}, [Refetch]);


	// for receiving signal from backend if there is a db update and control the refetch state
	useEffect(() => {
		const socketio = io("http://localhost:6565/");

		socketio.on("DB_Update", () => {
			console.log("Update has been Made");
			setRefetch(true);
		});

		return () => {
			socketio.disconnect();
		};
	});

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

	// **********************************************************************************************

	// This is for submitting the task after typing the in the Add task div
	// when clicked it first adds the task locally and then when task update signal received from the
	// backend the whole data is refetched so as to not have any latency issues
	function SubmitTask() {
		const Heading = AddTaskRef.current.value;
		if (Heading === "") {
			AddTaskRef.current.focus();
			AddTaskRef.current.style.outline = "0.7px solid rgb(239,68,68)";
		} else {
			AddTaskRef.current.style.outline = "none";
			console.log(Heading);
			fetch("http://localhost:6565/post", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					Heading: Heading,
					Pinned: false,
				}),
			})
				.then((res) => res.json())
				.then((res) => console.log(res, "Inserted"));
			setAddTask(false);
			//  Adding the new task locally
			setTasks([
				...Tasks,
				{
					Heading: Heading,
					Pinned: false,
				},
			]);
		}
	}

	// **********************************************************************************************

	// This is to delete the task from the DB
	function DeleteTask(data) {
		fetch("http://localhost:6565/delete", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		})
			.then((res) => console.log(res.json()))
			.then((res) => console.log(res, "Deleted"));

		// After deleting, inorder for fast update we are removing the item from the
		// "Tasks" state as well so we don't have to wait for the backend to trigger a update
		const NewTaskList = Tasks.filter((item) => item !== data);
		setTasks(NewTaskList);
		setDeletedTasks([data]);
		setDeleteModelStatus(true)
	}


	function UndoTask(){
		fetch("http://localhost:6565/post", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					Heading: DeletedTasks[0].Heading,
					Pinned: DeletedTasks[0].Pinned,
				}),
			})
				.then((res) => res.json())
				.then((res) => console.log(res, "Inserted"));

		setTasks([...Tasks,DeletedTasks[0]])
		setDeleteModelStatus(false)
		clearInterval(DeleteModalInterval)
	}


	// **********************************************************************************************

	// This is to update the task in the DB
	// It takes the modified item and the original item as those are needed in order to update the mongodb
	function UpdateTask(ModifiedItem, OriginalItem, index) {
		fetch("http://localhost:6565/update", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				OriginalItem: OriginalItem,
				ModifiedItem: ModifiedItem,
			}),
		})
			.then((res) => res.json())
			.then((res) => console.log(res, "Updated"));

		// After updating, inorder for fast update we are updating the item from the
		// "Tasks" state as well so we don't have to wait for the backend to trigger a update
		const TasksCopy = [...Tasks]; // We are copying the Tasks state as don't want to share the same memory location
		TasksCopy[index] = ModifiedItem; // Now we are updating the TasksCopy with the modified item
		setTasks(TasksCopy); // Now we are updating the Tasks state with the updated TasksCopy

	}

	// **********************************************************************************************

	return (
		<div className="relative">
			{/* +++++++++++++++++++++++++++++++++++++++++++++++++ Nav Bar +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}

			<div className="fixed w-full top-0 right-0 left px-2 z-[100] py-5 bg-background/50 backdrop-blur-sm ">
				<div className="flex justify-center items-center">
					<p className="font-Shadows_Into_Light text-6xl max-sm:text-5xl">
						Task I Will Do
					</p>

					{/* THis the task add button when controls the "AddTask" state */}
					<i
						onClick={() => {
							setAddTask(true);
						}}
						className="fa fa-plus-circle text-2xl mx-6 mt-1 text-white/50
					hover:text-white/100"
						aria-hidden="true"></i>
				</div>
			</div>

			{/* +++++++++++++++++++++++++++++++++++++++++++++++++ Task Delete Modal +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
			
			{DeleteModelStatus && (
				<div className="fixed w-full h-[60px] bottom-1 p-2 right-0 cursor-pointer">
					<div className="bg-primary w-full border border-red-500 h-[50px] p-5 rounded-md flex items-center justify-between ">
						<p className="text-lg">Task Deleted</p>
						<div onClick={UndoTask} className="flex items-center text-base hover:animate-pulse hover:text-green-400"> <i className="fas fa-arrow-rotate-left px-1" aria-hidden="true"></i> Undo</div>
					</div>
				</div>
			)}


			{/* +++++++++++++++++++++++++++++++++++++++++++++++++ Task's Area +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}

			{/* THis is where the fetched tasks are displayed */}
			<div className="absolute top-[50px] w-full">
				{/* this is New task adding part located */}

				{/* +++++++++++++++++++++++++++++++++++++++++++++++++ Task Adding Page +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}

				{AddTask && (
					<div className="bg-primary p-10 flex flex-col rounded-md border my-5">
						<textarea
							onInput={() => {
								AddTaskRef.current.style.outline =
									"0.7px solid rgb(255,255,255)";
								AddTaskRef.current.style.height = "auto";
								AddTaskRef.current.style.height =
									AddTaskRef.current.scrollHeight + "px";
							}}
							required
							id="TaskTestBox"
							placeholder="Please Enter a Task"
							ref={AddTaskRef}
							rows={1}
							className="bg-black/90 min-h-[24px] rounded-md text-white p-1"></textarea>
						<br />
						<div className="flex mx-auto">
							<div
								onClick={SubmitTask}
								className="w-[100px] mx-1 h-[40px] bg-secondary rounded-md flex justify-center items-center cursor-pointer hover:bg-green-500">
								Add Task{" "}
								<i
									className="fas fa-chevron-right pl-1"
									aria-hidden="true"></i>{" "}
							</div>
							<div
								// THis is to cancel the task adding process
								onClick={() => setAddTask(false)}
								onKeyUp={(e) => {
									if (e.key === "Escape"){
										console.warn("Escape Pressed")
										setAddTask(false)
									}
								}}
								className="w-[100px] mx-1 h-[40px] bg-secondary rounded-md flex justify-center items-center cursor-pointer hover:bg-red-500">
								Cancel{" "}
								<i
									className="fas fa-xmark pl-1"
									aria-hidden="true"></i>{" "}
							</div>
						</div>
					</div>
				)}

				{/* +++++++++++++++++++++++++++++++++++++++++++++++++ Task Editing Page +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}

				{EditTask && (
					<div className="bg-primary p-10 flex flex-col rounded-md border my-5">
						<textarea
							onInput={() => {
								AddTaskRef.current.style.outline =
									"0.7px solid rgb(255,255,255)";
								AddTaskRef.current.style.height = "auto";
								AddTaskRef.current.style.height =
									AddTaskRef.current.scrollHeight + "px";
							}}
							required
							id="TaskTestBox"
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
							<div
								onClick={() => {
									// We are sending the ModifiedItem, OriginalItem and the Index to the UpdateTask function
									UpdateTask(EditTaskValue.ModifiedItem, EditTaskValue.OriginalItem, EditTaskValue.Index)
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
								onClick={() => setEditTask(false)}
								className="w-[100px] mx-1 h-[40px] bg-secondary rounded-md flex justify-center items-center cursor-pointer hover:bg-red-500">
								Cancel{" "}
								<i
									className="fas fa-xmark pl-1"
									aria-hidden="true"></i>{" "}
							</div>
						</div>
					</div>
				)}

				{/* +++++++++++++++++++++++++++++++++++++++++++ Error Page +++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}

				{/* The error page is displayed if there are anyproblem in fetching the tasks */}
				{ErrorPage ? (
					<div className="bg-primary p-10 flex flex-col rounded-md border my-5">
						<div>
							<b>Something's Wrong !!</b>
						</div>
						<div>
							Try Again Later or Click here
							<i
								// THis for refreshing the page
								onClick={() => location.reload()}
								class="fas fa-arrow-rotate-right px-1 cursor-pointer hover:text-green-300 hover:animate-pulse"
								aria-hidden="true"></i>
							to refresh
						</div>
					</div>
				) : (

					// +++++++++++++++++++++++++++++++++++++++++++++++++ Nothing Page and Loading Page +++++++++++++++++++++++++++++++++++++++++++++++++

					<div>
						{/* In here it first checks if the "Tasks" state has any content, */}
						{/* if it has it will displays it */}
						{Object.keys(Tasks).length === 0 ? (
							<div>
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
							</div>
						) : (
							// This accesses the contents in the fetched json data
							// This part is separated as Pinned and Unpinned Tasks
							<div>
								<div className="p-5" />  {/* This is to add some space between the nav bar and the tasks */}
								{/* ++++++++++++++++++++++++++++++++++++++++ Pinned Tasks ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
								<div>
									{(Tasks.filter(item => item.Pinned === true)).length !== 0 && (<p className="p-2 text-base underline underline-offset-4 text-left">Pinned Tasks</p>)}
									{/* Now at first we are displaying the the Pinned items that has "Pinned" = True */}
									{Tasks.filter(
										(item) => item.Pinned === true
									).map((item, index) => (
										<div
											key={index}
											ref={(el) =>
												(TaskList.current[index] = el)
											}
											// We are using separate hover states for Pinned and Unpinned Tasks so as to not confict with Pinned and Unpinned Tasks
											// Since we are using Index as the key, we can't use the same hover state for both
											onMouseLeave={() => {
												setPinnedTaskHover(-1);
											}}
											// This is to set the height of the TaskOption div as its a "absolute" positioned div
											onClick={() => {
												setTaskOptionHeight(
													TaskList.current[index].clientHeight
												);
												setPinnedTaskHover(index);
											}}
											className="relative overflow-hidden bg-primary p-10 flex flex-col rounded-md border my-5">
											<div>
												<p>{item.Heading}</p>
											</div>
											{PinnedTaskHover === index && (
												<div
													style={{
														height: TaskOptionHeight + "px",
													}}
													className="absolute top-0 right-0 flex flex-col items-center justify-around text-background bg-white w-10">
													<i onClick={() => {
														// This is to set the EditTask state to true to open the editting page
														setEditTask(true)
														// The EditTaskValue state is used to store the Original, Modified as well as the Index of the item in the form of Dict
														setEditTaskValue({
															OriginalItem: item,
															ModifiedItem: { ...item },
															Index: index
														})
													}} className="fas fa-pen p-1 hover:text-orange-400"></i>
													<i
														onClick={() => {
															// Now inorder to update the item in MongoDb, We are sending the Original value
															// and the modified value which sets the "Pinned" to "True"
															const OriginalItem =
																{ ...item }; // we are using spread operator to copy the content of one dict to another dict
															if (item.Pinned === true) {
																item.Pinned = false;
															} else {
																item.Pinned = true;
															}
															UpdateTask(item, OriginalItem, index);
														}}
														className={`fas fa-thumbtack p-1 pb-0.5 hover:text-blue-500 ${item.Pinned ===
															false
															? "rotate-45"
															: "rotate-0 text-blue-500"
															}`}
														aria-hidden="true"></i>
													<i
														onClick={() =>
															DeleteTask(item)
														}
														className="fas fa-trash p-1 hover:text-red-500"></i>
												</div>
											)}
										</div>
									))}
								</div>

								{/* +++++++++++++++++++++++++++++++++++++++++++++ Un-Pinned Tasks+++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}

								<div>
									{(((Tasks.filter(item => item.Pinned === true)).length !== 0) && ((Tasks.filter(item => item.Pinned === false)).length !== 0)) && (<p className="p-2 text-base underline underline-offset-4 text-left">Other Tasks</p>)}
									{/* Now at first we are displaying the the Unpinned items that has "Pinned" = False */}
									{Tasks.filter(
										(item) => item.Pinned === false
									).map((item, index) => (
										<div
											key={index}
											ref={(el) => (TaskList.current[index] = el)}
											// We are using separate hover states for Pinned and Unpinned Tasks so as to not confict with Pinned and Unpinned Tasks
											// Since we are using Index as the key, we can't use the same hover state for both
											onMouseLeave={() => {
												setNonPinnedTaskHover(-1);
											}}
											// This is to set the height of the TaskOption div as its a "absolute" positioned div	
											onClick={() => {
												setTaskOptionHeight(
													TaskList.current[index].clientHeight
												);
												setNonPinnedTaskHover(index);
											}}
											className="relative overflow-hidden bg-primary p-10 flex flex-col rounded-md border my-5">
											<div>
												<p>{item.Heading}</p>
											</div>
											{NonPinnedTaskHover === index && (
												<div
													style={{
														height: TaskOptionHeight + "px",
													}}
													className="absolute top-0 right-0 flex flex-col items-center justify-around text-background bg-white w-10">
													<i onClick={() => {
														// This is to set the EditTask state to true to open the editting page
														setEditTask(true)
														// The EditTaskValue state is used to store the Original, Modified as well as the Index of the item in the form of Dict
														setEditTaskValue({
															OriginalItem: item,
															ModifiedItem: { ...item },
															Index: index
														})
													}} className="fas fa-pen p-1 hover:text-orange-400"></i>
													<i
														onClick={() => {
															// Now inorder to update the item in MongoDb, We are sending the Original value
															// and the modified value which sets the "Pinned" to "True"
															const OriginalItem = { ...item }; // we are using spread operator to copy the content of one dict to another dict
															if (item.Pinned === true) {
																item.Pinned = false;
															} else {
																item.Pinned = true;
															}
															UpdateTask(item, OriginalItem, index);
														}}
														className={`fas fa-thumbtack p-1 pb-0.5 hover:text-blue-500 ${item.Pinned ===
															false
															? "rotate-45"
															: "rotate-0 text-blue-500"
															}`}
														aria-hidden="true"></i>
													<i
														onClick={() =>
															DeleteTask(item)
														}
														className="fas fa-trash p-1 hover:text-red-500"></i>
												</div>
											)}
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};
