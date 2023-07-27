export function NavbarComponent({ setMenuBarStatus, setAddTask }) {
    
    return (
    <div className="fixed w-full top-0 right-0 left px-2 z-[100] py-5 bg-background/50 backdrop-blur-sm ">
        <div className="flex justify-center items-center">
            {
                /* This is the Menu Button and it controls the "MenuBarStatus" */
            }
            <i onClick={() => {
                setMenuBarStatus(true);
            }} className="fa fa-bars absolute left-0 p-0.5 text-2xl mx-6 mt-1 text-white/50
                  hover:text-white/100 mr-auto" aria-hidden="true"></i>

            <p className="font-Shadows_Into_Light text-6xl max-sm:text-5xl max-sm:pl-9">
                Task I Will Do
            </p>

            {
                /* THis the task add button when controls the "AddTask" state */
            }
            <i onClick={() => {
                setAddTask(true);
            }} className="fa fa-plus-circle absolute right-0 p-2 text-2xl mx-6 mt-1 text-white/50
                  hover:text-white/100 max-sm:hidden" aria-hidden="true"></i>
        </div>
    </div>);
}