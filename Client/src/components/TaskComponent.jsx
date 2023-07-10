import React, { useEffect, useRef, useState } from "react";

export const TaskComponent = () => {
	const [Tasks, setTasks] = useState([]);
	const [Fetched, setFetched] = useState(false);
	
	const AddTaskRef = useRef("")

	useEffect(() => {
		fetch("http://localhost:6565/get")
			.then((res) => res.json())
			.then((res) => {
				setTasks(res);
				setFetched(true);
			});
	}, []);

	function AddTask() {}

	return (
		<div>
			<div className="flex justify-center items-center">
				<p className="font-Shadows_Into_Light text-6xl">
					Task I Will Do
				</p>
				<i
					onClick={AddTask}
					class="fa fa-plus-circle text-2xl px-6 mt-1 text-white/50
				hover:text-white/100"
					aria-hidden="true"></i>
			</div>
			<br />

			<div className="bg-primary p-10 flex flex-col rounded-md border my-5">
				<textarea ref={AddTaskRef} className="bg-black/90 rounded-md text-white"></textarea>
				<br />
				<div className="w-[100px] h-[40px] mx-auto bg-secondary rounded-md flex justify-center items-center cursor-pointer hover:bg-black/30">Add Task <i class="fas fa-chevron-right px-1" aria-hidden="true"></i> </div>
			</div>

			{Object.keys(Tasks).length === 0 ? (
				<div>
					{Fetched ? (
						<div className="bg-primary p-10 flex flex-col rounded-md border my-5">
							<div><b>Nothing Here !!</b></div>
							<div>Add Some by Clicking the <i class="fa fa-plus-circle px-1" aria-hidden="true"></i>👆</div>
						</div>
					) : (
						<i
							class="fas fa-arrows-rotate text-2xl text-white/50 m-5 animate-spin"
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
