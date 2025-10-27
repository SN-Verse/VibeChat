import React, { useContext } from 'react'
import {Navigate, Route,Routes} from 'react-router-dom'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import ChatPage from './pages/ChatPage'
import Layout from './Layout'; 
import VibeRoom from './components/VibeRoom';
import {Toaster} from "react-hot-toast" 
import { AuthContext } from '../context/AuthContext'

const App = () => {
  const {authUser}=useContext(AuthContext)
  return (
    <div className="bg-[url('./assets/background4.jpg')] bg-contain">
      <Toaster/>
       {/* setting routes for every pages */}
       
      <Routes>
       <Route path='/login' element={!authUser ? <LoginPage/>: <Navigate to="/"/>} />
       <Route path='/profile' element={authUser ?< ProfilePage/>: <Navigate to="/login" />} />

       {/* Routes with layout */}
        <Route element={<Layout />}>
          
          <Route path="/" element={authUser? <ChatPage />:<Navigate to="/login"/> } /> 
          <Route path="/viberoom" element={<VibeRoom />} />
          <Route path="/viberoom/:roomId" element={<VibeRoom />} />
            </Route>
      </Routes>

    </div>
  )
}

export default App