import { useState, useEffect, createContext } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'

import './App.css'
import { TaskComponent } from './Components/TaskComponent'
import { HomeComponent } from './Components/HomeComponent';
import { ErrorComponent } from './Components/ErrorComponent';
import SignInComponent from './Authentication/Components/SignInComponent'
import SignUpComponent from './Authentication/Components/SignUpComponent'

import AuthContext from "./Authentication/Components/AuthContext"

function App() {
  const [Authstate, setAuthstate] = useState((localStorage.getItem("Authstate") == "true" ? true : false)) 

  useEffect(() => {
    localStorage.setItem("Authstate",Authstate)
  }, [Authstate])

  let Location = useLocation()

  return (
    <AuthContext.Provider value={{ Authstate, setAuthstate }}>
      <Routes >
        <Route path='/' element={<HomeComponent Authstate={Authstate} />} />
        {Authstate && <Route path='/tasks' element={<TaskComponent />} />}
        {!Authstate && <Route path='/signin' element={<SignInComponent setAuthstate={setAuthstate} />} />}
        {!Authstate && <Route path='/signup' element={<SignUpComponent setAuthstate={setAuthstate} />} />}
        <Route path='*' element={<ErrorComponent />}/>
      </Routes>
    </AuthContext.Provider>
  )
}

export default App
