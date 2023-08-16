import React, { useContext } from 'react'
import { TokenRefresh } from './AdditionalComponents'

import AuthContext from '../Authentication/Components/AuthContext';

const TrashComponent = ({ Tasks, setTasks, DeletedTasks, setDeletedTasks, setError, DeleteLoading, setDeleteLoading, setisAddTaskLoading, isAddTaskLoading}) => {

	const { GuestMode } = useContext(AuthContext);

	function DeleteTask(data) {
		
		if (!GuestMode) {
			(async () => {
				setDeleteLoading(true)
				await TokenRefresh("/delete","POST",data,{DeleteType : "fromTrash"})
				.then((res) => {
					setDeleteLoading(false)
					console.log(res.data)
					setDeletedTasks((prev) => prev.filter((item) => item.TaskID !== data.TaskID))
				})
				.catch((error) => {
					setError(error)
				})
			})()

		} else {
			setDeletedTasks((prev) => prev.filter((item) => item.TaskID !== data.TaskID))
		}
	}
	

	function CreateTask(data) {
        
		if (!GuestMode) {
			(async () => {
				setisAddTaskLoading(true)
				await TokenRefresh("/retreive","POST",data).then((res) => 
				{
					setisAddTaskLoading(false)
					console.log(res.data)
	
					//  Adding the new task locally
					setTasks((prev) => [...prev,data])
					setDeletedTasks((prev) => prev.filter((item) => item.TaskID !== data.TaskID))
	
				})
				.catch((error) => {
					setError(error)
				})
			})()

		} else {
			setTasks((prev) => [...prev,data])
			setDeletedTasks((prev) => prev.filter((item) => item.TaskID !== data.TaskID))
		}
	}


	function TaskOptions({ CustomClass, item }) {
		return (
			<div className={`${CustomClass} hidden m-[-40px] group-hover:flex flex-col items-center justify-around text-background bg-white w-10`}>
				<button>
					<i 
						onClick={() => CreateTask(item)}
						className={`${isAddTaskLoading ? "fas fa-circle-notch animate-spin text-green-500" : "fas fa-arrow-right-from-bracket -rotate-90"} p-1 hover:text-green-500`}></i>
				</button>
				<button disabled={DeleteLoading}>
					<i
						onClick={() => DeleteTask(item)}
						className={`${DeleteLoading ? "fas fa-circle-notch animate-spin text-red-500" : "fas fa-trash"} p-1 hover:text-red-500`}></i>
				</button>
			</div>
		);
	}

	function TaskDisplay({item, index }) {
		if (item.Type === "CheckList") {
			return (
				<div className="flex group">
					<TaskOptions CustomClass={"sm:!hidden mr-auto"} item={item} index={index} />
					<div className="flex-1 group-hover:max-sm:ml-5">
						{item.Contents.map((subitem, subindex) => <div key={subindex} className="flex">
								{!subitem.Checked && (
									<>
										<button onClick={() => {
												const UpdatedCheckListItems = JSON.parse(JSON.stringify(item));
												UpdatedCheckListItems.Contents[subindex].Checked = !UpdatedCheckListItems.Contents[subindex].Checked;
												UpdateTask(UpdatedCheckListItems, {TaskID : item["TaskID"]}, index);
											}} className={`cursor-default shrink-0 w-[13.5px] h-[13.5px] mt-[5px] mr-2 border border-secondary/70 bg-blue-500 rounded-sm flex items-center justify-center ${subitem.Checked === false && "!bg-white"}`}>
											<i className={`fa fa-check text-white text-[10px] pt-[1.5px] hidden ${subitem.Checked === true && "!block"}`} aria-hidden="true"></i>
										</button>
										<p className={`${subitem.Checked && "line-through brightness-50"} text-left`}>{subitem.Heading}</p>
									</>
								)}
							</div>
						)}

						{<div className="w-full h-[1px] bg-white/50 my-2" />}

						{item.Contents.map((subitem, subindex) => <div key={subindex} className="flex">
								{subitem.Checked && (
									<>
										<button onClick={() => {
												const UpdatedCheckListItems = JSON.parse(JSON.stringify(item));
												UpdatedCheckListItems.Contents[subindex].Checked = !UpdatedCheckListItems.Contents[subindex].Checked;
												UpdateTask(UpdatedCheckListItems, {TaskID : item["TaskID"]}, index);
											}} className={`cursor-default shrink-0 w-[13.5px] h-[13.5px] mt-[5px] mr-2 border border-secondary/70 bg-blue-500 rounded-sm flex items-center justify-center ${subitem.Checked === false && "!bg-white"}`}>
											<i className={`fa fa-check text-white text-[10px] pt-[1.5px] hidden ${subitem.Checked === true && "!block"}`} aria-hidden="true"></i>
										</button>
										<p className={`${subitem.Checked && "line-through brightness-50"} text-left`}>{subitem.Heading}</p>
									</>
								)}
							</div>
						)}
						
					</div>
					<TaskOptions CustomClass={"max-sm:!hidden ml-auto"} item={item} index={index} />
				</div>
			)
		} else {
			return (
				<div className="flex justify-center">
					<TaskOptions CustomClass={"sm:!hidden mr-auto"} item={item} index={index} />
					<p className="flex-1">{item.Heading}</p>
					<TaskOptions CustomClass={"max-sm:!hidden ml-auto"} item={item} index={index} />
				</div>
			)
		}	
    }


	return (
		<div>
		  	{DeletedTasks.length === 0 ? (
				<div className="bg-primary p-10 flex flex-col rounded-md border my-5">
					<div>
						<b>Nothing Here !!</b>
					</div>
					<div>
						Its All Clean for Now 😉
					</div>
				</div>
			) : (
				// This accesses the contents in the fetched json data
				<>
					<div className="p-5" />  {/* This is to add some space between the nav bar and the tasks */}
					{/* ++++++++++++++++++++++++++++++++++++++++ Pinned Tasks ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
					{DeletedTasks.map((item, index) => 
						<div key={index} style={{backgroundColor: item.Color}} className="group relative overflow-hidden bg-primary p-10 flex flex-col rounded-md border my-5">
							<TaskDisplay DeleteLoading={DeleteLoading} item={item} index={index} DeleteTask={DeleteTask}  />
						</div>
					)}

				</>
			)}
		</div>
	)
}

export default TrashComponent