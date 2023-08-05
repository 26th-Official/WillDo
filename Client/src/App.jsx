import { useState, useEffect, createContext } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'

import './App.css'
import { TaskComponent } from './Components/TaskComponent'
import { AuthComponent } from './Authentication/Components/AuthComponent'
import { HomeComponent } from './Components/HomeComponent';
import { ErrorComponent } from './Components/ErrorComponent';
import SignInComponent from './Authentication/Components/SignInComponent'
import SignUpComponent from './Authentication/Components/SignUpComponent'

import AuthContext from "./Authentication/Components/AuthContext"

function App() {
  const [AuthMode, setAuthMode] = useState("None") // "None" , "SignIn" , "SignUp" ,"Tasks"

  let Location = useLocation()

  return (
    <AuthContext.Provider value={{ AuthMode, setAuthMode }}>
      <Routes >
        <Route path='/' element={<HomeComponent setAuthMode={setAuthMode} />} />
        <Route path='/tasks' element={<TaskComponent />} />
        <Route path='/signin' element={<SignInComponent setAuthMode={setAuthMode} />} />
        <Route path='/signup' element={<SignUpComponent setAuthMode={setAuthMode} />} />

        <Route path='*' element={<ErrorComponent />}/>
      </Routes>
    </AuthContext.Provider>
  )
}

export default App
