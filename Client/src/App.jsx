import { useState, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'

import './App.css'
import TaskComponent from './Components/TaskComponent'
import HomeComponent from './Components/HomeComponent';
import ErrorComponent from './Components/ErrorComponent';
import SignInComponent from './Authentication/Components/SignInComponent'
import SignUpComponent from './Authentication/Components/SignUpComponent'
import ResetPasswordComponent from './Authentication/Components/ResetPasswordComponent';
import ForgotPasswordComponent from './Authentication/Components/FOrgotPasswordComponent';

import AuthContext from "./Authentication/Components/AuthContext"

function App() {
	const [Authstate, setAuthstate] = useState((localStorage.getItem("Authstate") == "true" ? true : false)) 
	const [ResetPassword, setResetPassword] = useState(false)
	const [UserID, setUserID] = useState(localStorage.getItem("UserID"))

	useEffect(() => {
		localStorage.setItem("Authstate",Authstate)
	}, [Authstate])

	return (
		<AuthContext.Provider value={{ Authstate, setAuthstate, UserID, setResetPassword }}>
			<Routes >
				<Route path='/' element={<HomeComponent Authstate={Authstate} />} />
				{!Authstate && <Route path='/forgot' element={<ForgotPasswordComponent />} />}
				{Authstate && <Route path='/tasks' element={<TaskComponent />} />}
				{!Authstate && <Route path='/signin' element={<SignInComponent setUserID={setUserID} />} />}
				{!Authstate && <Route path='/signup' element={<SignUpComponent />} />}
				{ResetPassword && <Route path='/reset' element={<ResetPasswordComponent />} />}	
				<Route path='*' element={<ErrorComponent />}/>
			</Routes>
		</AuthContext.Provider>
	)
}

export default App
