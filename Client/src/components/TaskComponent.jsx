// Importing the required modules

import React, { useEffect, useRef, useState } from "react";
// for realtime data fetching from backend
import io from "socket.io-client";

// =============================================

export const TaskComponent = () => {
	// to store the tasks from db
	const [Tasks, setTasks] = useState([]);
	// to check is the tasks are fetched for first time or else display the loading animation
	const [Fetched, setFetched] = useState(false);
	// its for displaying the div for typing new tasks
	const [AddTask, setAddTask] = useState(false);
	// when the db update signal received from backend it triggers the useeffect to fetch the data from db
	const [Refetch, setRefetch] = useState(true);
	// Check if the task is hovered or not
	const [TaskHover, setTaskHover] = useState(-1);
	// It stores the height of the task option div that is being hovered
	const [TaskOptionHeight, setTaskOptionHeight] = useState(0);

	const [ErrorPage, setErrorPage] = useState(false);

	// ==========================================================

	// for the text in the new task div
	const AddTaskRef = useRef("");
	// It contains the all the div of tasks
	const TaskList = useRef([]);

	// ==========================================================

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

	// ==========================================================

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
				}),
			})
				.then((res) => res.json())
				.then((res) => console.log(res));
			setAddTask(false);
			//  Adding the new task locally
			setTasks([
				...Tasks,
				{
					Heading: Heading,
				},
			]);
		}
	}

	// ==========================================================

	return (
		<div className="relative">
			{/*  Nav bar of the website */}
			<div className="fixed w-full top-0 right-0 left px-2 z-[100] py-5 bg-background/50 backdrop-blur-sm ">
				<div className="flex justify-center items-center">
					<p className="font-Shadows_Into_Light text-6xl max-sm:text-5xl">
						Task I Will Do
					</p>

					{/* THis the task add button when controls the "AddTask" state */}
					<i
						onClick={() => setAddTask(true)}
						className="fa fa-plus-circle text-2xl mx-6 mt-1 text-white/50
					hover:text-white/100"
						aria-hidden="true"></i>
				</div>
			</div>

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

				{/* The error paGGge is displayed if there are anyproblem in fetching the tasks */}
				{ErrorPage ? (
					<div className="bg-primary p-10 flex flex-col rounded-md border my-5">
						<div>
							<b>Something's Wrong !!</b>
						</div>
						<div>
							Try Again Later or Click here
							<i onClick={() => location.reload()} class="fas fa-arrow-rotate-right px-1" aria-hidden="true"></i>
							to refresh
						</div>
					</div>
				) : (
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
							Tasks.map((item, index) => (
								<div
									key={index}
									ref={(el) => (TaskList.current[index] = el)}
									onMouseLeave={() => {
										setTaskHover(-1)
									}}
									onClick={() => {
										setTaskOptionHeight(
											TaskList.current[index].clientHeight
										);
										setTaskHover(index);
									}}
									className="relative overflow-hidden bg-primary p-10 flex flex-col rounded-md border my-5">
									<div>
										<p>{item.Heading}</p>
									</div>
									{TaskHover === index && (
										<div
											style={{
												height: TaskOptionHeight + "px",
											}}
											className="absolute top-0 right-0 flex flex-col items-center justify-around text-background bg-white w-10">
											<i className="fas fa-pen p-1 hover:text-orange-400"></i>
											<i className="fas fa-trash p-1 hover:text-blue-500"></i>
										</div>
									)}
								</div>
							))
						)}
					</div>
				)}
			</div>
		</div>
	);
};
