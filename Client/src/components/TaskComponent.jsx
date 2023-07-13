import React, { useEffect, useRef, useState } from "react";
import io from 'socket.io-client';



export const TaskComponent = () => {
	const [Tasks, setTasks] = useState([]);
	const [Fetched, setFetched] = useState(false);
	const [AddTask, setAddTask] = useState(false);
	const [Refetch, setRefetch] = useState(true)
	
	const AddTaskRef = useRef("")

	useEffect(() => {
		if (Refetch){
			fetch("http://localhost:6565/getall")
			.then((res) => res.json())
			.then((res) => {
				setTasks(res);
				setFetched(true);
				setRefetch(false)
			});
		}
	}, [Refetch]);

	useEffect(() => {
		const socketio = io("http://localhost:6565/")

		socketio.on("DB_Update",() => {
			console.log("Update has been Made")
			setRefetch(true)
		})

		return () => {
			socketio.disconnect()
		}
	})



	function SubmitTask() {
		const Heading = AddTaskRef.current.value
		if(Heading === "") {
			AddTaskRef.current.focus()
			AddTaskRef.current.style.outline = "0.7px solid rgb(239,68,68)"
		}
		else {
			AddTaskRef.current.style.outline = "none"
			console.log(Heading)
			fetch("http://localhost:6565/post",{
				method: "POST",
				headers: {"Content-Type" : "application/json"},
				body: JSON.stringify({
					"Heading" : Heading,
				})
			}).then(res => res.json()).then(res => (console.log(res)))
			setAddTask(false)
			setTasks([...Tasks,{
				"Heading" : Heading,
			}])
		}
	}

	return (
		<div className="relative">
			<div className="fixed w-full top-0 right-0 left px-2 z-[100] py-5 bg-background/50 backdrop-blur-sm ">
				<div className="flex justify-center items-center">
					<p className="font-Shadows_Into_Light text-6xl max-sm:text-5xl">
						Task I Will Do 
					</p>
					<i
						onClick={() => setAddTask(true)} 
						className="fa fa-plus-circle text-2xl mx-6 mt-1 text-white/50
					hover:text-white/100"
						aria-hidden="true"></i>
				</div>
			</div>

			<div className="absolute top-[50px] w-full">
				{AddTask && (
					<div className="bg-primary p-10 flex flex-col rounded-md border my-5">
						<textarea onInput={() => {
							AddTaskRef.current.style.outline = "0.7px solid rgb(255,255,255)"
							AddTaskRef.current.style.height = "auto"
							AddTaskRef.current.style.height = AddTaskRef.current.scrollHeight + "px"
						}} required placeholder="Please Enter a Task" ref={AddTaskRef} rows={1} className="bg-black/90 min-h-[24px] rounded-md text-white p-1"></textarea>
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
						<div id="TaskContainer" key={index} className="relative overflow-hidden bg-primary p-10 flex flex-col rounded-md border my-5">
							<div>
								<p>{item.Heading}</p>
							</div>
							<div id="TaskDelete" className="absolute top-0 right-0 bg-red-500 w-10 "></div>
						</div>
					))
				)}
			</div>
		</div>
	);
};
