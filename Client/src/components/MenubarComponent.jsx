import React from "react";

export function MenubarComponent({setMenuBarStatus}) {

	return (
	<>
		<div onClick={() => {
			setMenuBarStatus(false);
		}} className="fixed w-[100vw] h-[100vh] left-0 top-0 z-[100] bg-primary/50 backdrop-blur-sm"></div>
		<div className="fixed left-0 top-0 h-[100vh] w-[40%] max-sm:w-[80%] p-5 z-[110] border-r-2 bg-primary flex flex-col">
			<div className="w-full">
				<i onClick={() => {
					setMenuBarStatus(false);
				}} className="fas fa-arrow-right-to-bracket rotate-180 text-2xl text-white/50
					hover:text-white/100 float-right m-2" aria-hidden="true"></i>
			</div>
			<p className="p-3 bg-secondary m-2 rounded-md hover:bg-secondary/50">Archive</p>
			<p className="p-3 bg-secondary m-2 rounded-md hover:bg-secondary/50">Trash</p>
			<p className="p-3 bg-secondary m-2 rounded-md hover:bg-secondary/50">Settings</p>
			<p className="p-3 bg-secondary m-2 rounded-md hover:bg-red-500 mt-auto">Sign out</p>
		</div>
	</>
)}
