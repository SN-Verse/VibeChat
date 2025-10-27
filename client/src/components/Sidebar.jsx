import React, { useContext, useEffect, useState } from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { ChatContext } from '../../context/ChatContext'
import SocialSection from './SocialSection'; // Add this import
import { UserPlus } from 'lucide-react'; // Or use your own SVG/icon

const Sidebar = () => {

    // Use friends and getSocialData instead of users and getUsers
    const {getSocialData, friends, selectedUser, setSelectedUser, unseenMessages, setUnseenMessages, receivedRequests } = useContext(ChatContext)
    const {logout, onlineUsers} = useContext(AuthContext)
    const [input, setInput] = useState('')
    const [showSocial, setShowSocial] = useState(false);
    const navigate = useNavigate();

    // Filter friends by search input
    const filteredFriends = input
        ? friends.filter((user) => user.fullName.toLowerCase().includes(input.toLowerCase()))
        : friends;

    useEffect(() => {
        getSocialData()
    }, [onlineUsers, getSocialData])

    return (
        <div className={`bg-[#8185B2]/20 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${selectedUser? "max-md:hidden":'' } `}>
            <div className='pb-5'>
                <div className='flex justify-between items-center'>
                    <img src={assets.logo} alt="logo" className='max-w-40' />
                    <div className="flex items-center gap-2">
                        {/* Social/Add Contact Icon Button */}
                        <div className="relative group">
                            <button
                                onClick={() => setShowSocial(true)}
                                className="p-2 rounded-full hover:bg-purple-600/30 transition"
                                title="Social / Add Friends"
                            >
                                {/* You can use an SVG or lucide-react UserPlus icon */}
                                <UserPlus className="w-6 h-6 text-purple-300" />
                                {/* Notification badge */}
                                {receivedRequests.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                                        {receivedRequests.length}
                                    </span>
                                )}
                            </button>
                        </div>
                        {/* Menu Icon */}
                        <div className='relative py-2 group'>
                            <img src={assets.menu_icon} alt="Menu" className='max-h-5 px-11 cursor-pointer' />
                            <div className='absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100 hidden group-hover:block' >
                                <p onClick={()=>navigate('/profile')} className='cursor-pointer text-sm'>Edit Profile</p>
                                <hr className='my-2 border-t border-gray-500' />
                                <p onClick={()=> logout()} className='cursor-pointer text-sm'>LogOut</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5' >
                    <img src={assets.search_icon} alt="Search" className='w-3' />
                    <input onChange={(e)=>setInput(e.target.value)} type="text" className='bg-transparent border-none outline-none text-white text-xs placeholder:[#c8c8c8] flex-1 'placeholder='Search User...'  />
                </div>
                {/* <button
                    className="w-full bg-purple-600 text-white py-2 rounded-lg mt-4 hover:bg-purple-700 transition"
                    onClick={() => setShowSocial(true)}
                >
                    Social / Add Friends
                </button> */}
            </div >
            <div className='flex flex-col'>
                {filteredFriends.map((user, index) => (
                    <div 
                        onClick={() => {
                            setSelectedUser(user); 
                            setUnseenMessages(prev => ({...prev, [user._id]: 0}));
                        }} 
                        key={index} 
                        className={`relative flex items-center gap-2 p-2 pl-4 rounded-lg cursor-pointer 
                            max-sm:text-sm transition-all duration-300 ease-in-out
                            hover:bg-purple-500/20 hover:scale-105 hover:shadow-lg
                            ${selectedUser?._id === user._id ? 'bg-[#282142]/50 scale-105' : ''}`}
                    >
                        <img 
                            src={user?.profilePic || assets.avatar_icon} 
                            alt="" 
                            className='w-[35px] aspect-[1/1] rounded-full transition-transform duration-300 hover:scale-110'
                        />    
                        <div className='flex flex-col leading-5'>
                            <p className="font-medium hover:text-purple-400 transition-colors justify-center">{user.fullName}</p>
                            <span className={`text-xs transition-colors duration-300 ${
                                onlineUsers.includes(user._id) 
                                    ? 'text-green-400' 
                                    : 'text-neutral-400'
                            }`}>
                                {onlineUsers.includes(user._id) ? 'Online' : 'Offline'}
                            </span>
                        </div>
                        {unseenMessages[user._id] > 0 && (
                            <div className='absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50 
                                animate-pulse transition-transform duration-300 hover:scale-110'>
                                {unseenMessages[user._id]}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {showSocial && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-[#282142] rounded-xl shadow-2xl p-6 w-full max-w-lg relative">
                        <button
                            className="absolute top-2 right-2 text-white bg-red-500 rounded-full px-3 py-1"
                            onClick={() => setShowSocial(false)}
                        >
                            X
                        </button>
                        <SocialSection />
                    </div>
                </div>
            )}
        </div>
    )
}

export default Sidebar