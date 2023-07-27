import React from "react";

export function ChecklistTaskComponent({ TaskOptionHeight, setEditTask, setEditTaskValue, item, UpdateTask, index, DeleteTask }) {
	
  return (
		<div
			style={{
				height: TaskOptionHeight + "px",
			}}
			className="absolute max-sm:left-0 top-0 right-0 flex flex-col items-center justify-around text-background bg-white w-10">
			<i
				onClick={() => {
					// This is to set the EditTask state to true to open the editting page
					setEditTask(true); // The EditTaskValue state is used to store the Original, Modified as well as the Index of the item in the form of Dict

					setEditTaskValue({
						OriginalItem: item,
						ModifiedItem: {
							...item,
						},
						Index: index,
					});
				}}
				className="fas fa-pen p-1 hover:text-orange-400"></i>
			<i
				onClick={() => {
					// Now inorder to update the item in MongoDb, We are sending the Original value
					// and the modified value which sets the "Pinned" to "True"
					const OriginalItem = {
						...item,
					}; // we are using spread operator to copy the content of one dict to another dict

					if (item.Pinned === true) {
						item.Pinned = false;
					} else {
						item.Pinned = true;
					}

					UpdateTask(item, OriginalItem, index);
				}}
				className={`fas fa-thumbtack p-1 pb-0.5 hover:text-blue-500 ${
					item.Pinned === false
						? "rotate-45"
						: "rotate-0 text-blue-500"
				}`}
				aria-hidden="true"></i>
			<i
				onClick={() => DeleteTask(item)}
				className="fas fa-trash p-1 hover:text-red-500"></i>
		</div>
	);
}
