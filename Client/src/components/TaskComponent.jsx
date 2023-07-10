import React, { useEffect, useRef, useState } from "react";

export const TaskComponent = () => {
	const [Tasks, setTasks] = useState([]);
	const [Fetched, setFetched] = useState(false);
	const [AddTask, setAddTask] = useState(false);
	
	const AddTaskRef = useRef("")

	useEffect(() => {
		fetch("http://localhost:6565/get")
			.then((res) => res.json())
			.then((res) => {
				setTasks(res);
				setFetched(true);
			});
	}, []);

	function SubmitTask() {
		const Heading = AddTaskRef.current.value
		if(Heading === "") return
	}

	return (
		<div>
			<div className="flex justify-center items-center">
				<p className="font-Shadows_Into_Light text-6xl">
					Task I Will Do
				</p>
				<i
					onClick={() => setAddTask(true)} 
					className="fa fa-plus-circle text-2xl px-6 mt-1 text-white/50
				hover:text-white/100"
					aria-hidden="true"></i>
			</div>
			<br />

			{AddTask && (
				<div className="bg-primary p-10 flex flex-col rounded-md border my-5">
					<textarea  onInput={() => {
						AddTaskRef.current.style.height = "auto"
						AddTaskRef.current.style.height = AddTaskRef.current.scrollHeight + "px"
					}}   ref={AddTaskRef} rows={1} className="bg-black/90 min-h-[24px] rounded-md text-white p-1"></textarea>
					<br />
					<div className="flex mx-auto">
						<div onClick={SubmitTask} className="w-[100px] mx-1 h-[40px] bg-secondary rounded-md flex justify-center items-center cursor-pointer hover:bg-green-500">Add Task <i className="fas fa-chevron-right pl-1" aria-hidden="true"></i> </div>
						<div onClick={() => setAddTask(false)} className="w-[100px] mx-1 h-[40px] bg-secondary rounded-md flex justify-center items-center cursor-pointer hover:bg-red-500">Cancel <i className="fas fa-xmark pl-1" aria-hidden="true"></i> </div>
					</div>
				</div>
			)}

			{Object.keys(Tasks).length === 0 ? (
				<div>
					{Fetched ? (
						<div className="bg-primary p-10 flex flex-col rounded-md border my-5">
							<div><b>Nothing Here !!</b></div>
							<div>Add Some by Clicking the <i className="fa fa-plus-circle px-1" aria-hidden="true"></i>👆</div>
						</div>
					) : (
						<i
							className="fas fa-arrows-rotate text-2xl text-white/50 m-5 animate-spin"
							aria-hidden="true"></i>
					)}
				</div>
			) : (
				Tasks.map((item, index) => (
					<div className="bg-primary p-10 flex flex-col rounded-md border my-5">
						<div key={index}>
							<p>{item.Heading}</p>
						</div>
					</div>
				))
			)}
		</div>
	);
};
