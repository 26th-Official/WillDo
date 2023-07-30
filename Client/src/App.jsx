import { useState } from 'react'
import './App.css'
import { TaskComponent } from './components/TaskComponent'
import { AuthComponent } from './Authentication/Components/AuthComponent'

function App() {
  
  return (
    <div className='relative'>
      {/* <TaskComponent/> */}
      <AuthComponent/>
    </div>
  )
}

export default App
