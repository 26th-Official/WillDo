import React from "react";
import { useNavigate } from "react-router-dom";

export function DeleteTaskModal({UndoTask}) {
	return (
	<div className="fixed w-full h-[60px] bottom-1 z-[90] p-2 right-0 cursor-pointer">
		<div className="bg-primary w-full border border-red-500 h-[50px] p-5 rounded-md flex items-center justify-between ">
			<p className="text-lg">Task Deleted</p>
			<div onClick={UndoTask} className="flex items-center text-base hover:animate-pulse hover:text-green-400"> <i className="fas fa-arrow-rotate-left px-1" aria-hidden="true"></i> Undo</div>
		</div>
	</div>
)}

export function ErrorPageComponent({}) {
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

export function TaskOptions({ CustomClass, setEditTask, setEditTaskValue, item, setEditCheckBoxTask, setCheckListItems, index, DeleteTask }) {
	return (
		<div className={`${CustomClass} hidden m-[-40px] group-hover:flex flex-col items-center justify-around text-background bg-white w-10`}>
			<i
				onClick={() => {
					if (item.Type === "CheckList"){
						setEditTask(true); // This is to set the EditTask state to true to open the editting page
						setEditCheckBoxTask(true)
						setCheckListItems({
							...item,
							Index: index,
							OriginalItem: item,
						})
					} else {
						// This is to set the EditTask state to true to open the editting page
						setEditTask(true); // The EditTaskValue state is used to store the Original, Modified as well as the Index of the item in the form of Dict

						setEditTaskValue({
							OriginalItem: item,
							ModifiedItem: { ...item },
							Index: index,
						});
					}
				}}
				className="fas fa-pen p-1 hover:text-orange-400"></i>
			<i
				onClick={() => DeleteTask(item)}
				className="fas fa-trash p-1 hover:text-red-500"></i>
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
