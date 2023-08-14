import { useState, useContext } from "react"
import { TokenRefresh } from "./AdditionalComponents"

import AuthContext from "../Authentication/Components/AuthContext";

export function NavbarComponent({TrashPage, setTrashPage, setMenuBarStatus, setAddTask, setError, setDeletedTasks, DeletedTasks }) {
    
    const { GuestMode } = useContext(AuthContext);

    // Its for indicating the loading while the all the Trash tasks are deleting
	const [AllDeleteLoading, setAllDeleteLoading] = useState(false)

    function DeleteTask() {
        
        if (!GuestMode){
            if (DeletedTasks.length === 0) {
                return
            }
            
            (async () => {
                setAllDeleteLoading(true)
                await TokenRefresh("/delete","POST",{}, {DeleteType : "fromTrashAll"})
                .then((res) => {
                    setAllDeleteLoading(false)
                    console.log(res.data)
                    setDeletedTasks([])
                })
                .catch((error) => {
                    setError(error)
                })
            })()

        } else {
            if (DeletedTasks.length === 0) {
                return
            }
            setDeletedTasks([])
        }
	}

    
    return (
    <div className="fixed w-full top-0 right-0 left px-2 z-[100] py-5 bg-background/50 backdrop-blur-sm ">
        <div className="flex justify-center items-center">
            { /* This is the Menu Button and it controls the "MenuBarStatus" */ }
            <button onClick={() => {
                setMenuBarStatus(true);
            }} className="fa fa-bars absolute left-0 p-0.5 text-2xl mx-6 mt-1 text-white/50
                  hover:text-white/100 mr-auto" aria-hidden="true"></button>

            <button onClick={() => {
                if (TrashPage) {
                    setTrashPage(false)
                }
            }} className="font-Shadows_Into_Light text-6xl max-sm:text-5xl max-sm:pl-9">
                {!TrashPage ? "Task I Will Do" : "Trash Bin"}
            </button>


            {TrashPage ? (
                <button disabled={AllDeleteLoading} onClick={() => {
                    DeleteTask()
                }} className={`${AllDeleteLoading ? "fas fa-circle-notch animate-spin text-red-500" : "fas fa-trash"} absolute right-0 p-2 text-2xl mx-6 mt-1 text-white/50
                hover:text-red-500 max-sm:hidden`} aria-hidden="true"></button>
            ) : (
                <button onClick={() => {
                    setAddTask(true)
                }} className="fa fa-plus-circle absolute right-0 p-2 text-2xl mx-6 mt-1 text-white/50
                hover:text-white/100 max-sm:hidden" aria-hidden="true"></button>
            )}

        </div>
    </div>);
}