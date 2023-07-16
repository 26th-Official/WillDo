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
		console.log(data);
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
	}

	// **********************************************************************************************

	// This is to update the task in the DB
	// It takes the modified item and the original item as those are needed in order to update the mongodb
	function UpdateTask(ModifiedItem, OriginalItem, index) {
		console.log(ModifiedItem);
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
		const UpdatedDict = { ...TasksCopy[index] }; //Now we are just picking the item that we want to update
		UpdatedDict.keys = ModifiedItem.keys; // Now we are changing the value of the original with modified one

		TasksCopy[index] = UpdatedDict; // Finally we are updating the TasksCopy with the updated item
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

			{/* +++++++++++++++++++++++++++++++++++++++++++++++++ Task Adding Page +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}

			{/* THis is where the fetched tasks are displayed */}
			<div className="absolute top-[50px] w-full">
				{/* this is New task adding part located */}
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
								<div className="p-5"/>  {/* This is to add some space between the nav bar and the tasks */}
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
														<i className="fas fa-pen p-1 hover:text-orange-400"></i>
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
																UpdateTask(item,OriginalItem,index);
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
													<i className="fas fa-pen p-1 hover:text-orange-400"></i>
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
															UpdateTask(item,OriginalItem,index);
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
