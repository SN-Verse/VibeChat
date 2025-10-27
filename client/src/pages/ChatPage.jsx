import React, { useContext } from 'react';
import Sidebar from '../components/Sidebar';
import ChatContainer from '../components/ChatContainer';
import RightSidebar from '../components/RightSidebar';
import { ChatContext } from '../../context/ChatContext';
import ParticleNetwork from '../components/ParticleNetwork'; // Adjust the path as needed

const ChatPage = () => {
  const { selectedUser } = useContext(ChatContext); 

  return (
    <div className="relative w-full h-screen bg-gray-900">
      <ParticleNetwork />
      <div className="relative z-10 flex flex-col items-center justify-center h-full"> 
        <div className="border w-full h-screen sm:px-[-15%] sm:py-[1%]">
          <div
            className={`backdrop-blur-s border-2 border-gray-600 rounded-2xl overflow-hidden h-[100%] grid grid-cols-1 relative ${
              selectedUser
                ? 'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]'
                : 'md:grid-cols-2'
            }`}
          >
            <Sidebar />
            <ChatContainer />
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;