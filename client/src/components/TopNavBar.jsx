// components/TopNavBar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Ghost		, Mic } from 'lucide-react';

const navItems = [
  { label: 'Chat Room', path: '/', icon: <MessageSquare /> },
  { label: 'Vibe Room', path: '/viberoom', icon: <Ghost /> },

];

const TopNavBar = () => {
  const navigate = useNavigate();

  return ( 
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex gap-4">
      {navItems.map((item, idx) => (
        <div
          key={idx}
          onClick={() => navigate(item.path)}
          className="group relative flex items-center justify-center cursor-pointer bg-purple-500 backdrop-blur-md p-2 rounded-full hover:px-5 hover:rounded-xl hover:shadow-xl transition-all duration-300"
        >
          {item.icon}
          <span className="absolute top-full mt-1 opacity-0 group-hover:opacity-100 text-white text-xs transition-all duration-300 whitespace-nowrap">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TopNavBar;
