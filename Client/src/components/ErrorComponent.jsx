import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { HeaderComponent } from "./AdditionalComponents";

export function ErrorComponent() {
	const [Redirect,setRedirect] = useState(false)

	let Navigate = useNavigate()
	
	useEffect(() => {
		const MainInterval = setInterval(() => {
			setRedirect(true)
		},[3000])

		return () => {
			clearInterval(MainInterval)
		}
	},[])

	useEffect(() => {
		const SubInterval = setInterval(() => {
			Navigate("/")
		},[3300])

		return () => {
			clearInterval(SubInterval)
		}
	},[Redirect])

	return (
		<div className="overflow-clip">
			<HeaderComponent />
			<div className="h-5" />
			<div className="w-[600px] max-sm:w-[300px] relative overflow-clip mx-auto">
				<img className="cursor-pointer" 
				onClick={() => {
					Navigate("/")
				}} src="/404_Error_Image.svg" alt="Error_Image" />
				{Redirect ? (
					<p className="absolute animate-pulse text-green-500 z-[100] rotate-[3.5deg] left-[241px] top-[390px] text-[22px] font-extrabold">
						Redirecting...
					</p>
				) : (
					<p className="absolute animate-pulse text-red-500 z-[100] rotate-[4deg] left-[248px] top-[388px] text-3xl font-extrabold">
						ERROR !!
					</p>
				)}
			</div>
		</div>
	);
}
export default ErrorComponent;
