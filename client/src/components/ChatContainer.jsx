import React, { useContext, useEffect, useRef, useState } from 'react'
import assets from '../assets/assets'
import { formatMessageTime } from '../lib/utils'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Trash2, Search, Image as ImageIcon } from 'lucide-react'
import { formatDateForGrouping } from "../utils/formatDate"


const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage: contextSendMessage, getMessages, deleteMessage } = useContext(ChatContext)
  const { authUser, onlineUsers } = useContext(AuthContext)
  const scrollEnd = useRef()
  const [input, setInput] = useState('')
  const [showDeleteOptions, setShowDeleteOptions] = useState(null)
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [confirmDelete, setConfirmDelete] = useState({ show: false, messageId: null, deleteFor: null })

  useEffect(() => {
    if (selectedUser) getMessages(selectedUser._id)
  }, [selectedUser, getMessages])

  useEffect(() => {
    if (scrollEnd.current && messages) scrollEnd.current.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Search logic
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }
    const results = messages
      .map((msg, idx) => ({ ...msg, idx }))
      .filter(msg => msg.text && msg.text.toLowerCase().includes(searchTerm.toLowerCase()))
    setSearchResults(results)
  }, [searchTerm, messages])

  // Group messages by date
  const groupMessagesByDate = (msgs) => {
    const filtered = msgs.filter(msg => !msg.deletedFor?.includes(authUser._id))
    const groups = {}
    filtered.forEach(msg => {
      const date = formatDateForGrouping(msg.createdAt)
      if (!groups[date]) groups[date] = []
      groups[date].push(msg)
    })
    return groups
  }

  // Use search results if searching
  const displayedMessages = searchTerm ? searchResults.map(r => messages[r.idx]) : messages

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    await contextSendMessage({ text: input.trim() }, selectedUser._id)
    setInput("")
  }

  // Send image
  const handleSendImage = async (e) => {
    const file = e.target.files[0]
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Select an image file")
      return
    }
    const reader = new FileReader()
    reader.onloadend = async () => {
      await contextSendMessage({ image: reader.result }, selectedUser._id)
      e.target.value = ""
    }
    reader.readAsDataURL(file)
  }

  // Confirm delete
  const handleConfirmDelete = () => {
    if (confirmDelete.show && confirmDelete.messageId && confirmDelete.deleteFor) {
      deleteMessage(confirmDelete.messageId, confirmDelete.deleteFor)
      setConfirmDelete({ show: false, messageId: null, deleteFor: null })
      setShowDeleteOptions(null)
    }
  }

  // Cancel delete
  const handleCancelDelete = () => {
    setConfirmDelete({ show: false, messageId: null, deleteFor: null })
  }

  return selectedUser ? (
    <div className='h-full overflow-y-scroll relative backdrop-blur-lg'>
      {/* Header */}
      <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>
        <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className='w-8 rounded-full' />
        <p className='flex-1 text-lg text-white flex items-center gap-2'>
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && <span className='w-2 h-2 rounded-full bg-green-500'></span>}
        </p>
        <Search
          className="w-5 h-5 cursor-pointer text-gray-400 hover:text-white"
          onClick={() => setShowSearch((prev) => !prev)}
        />
        <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} alt="" className='md:hidden max-w-7' />
      </div>

      {/* Search input */}
      {showSearch && (
        <div className="px-4 py-2 border-b border-stone-500 bg-gray-900">
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white placeholder-gray-400"
            autoFocus
          />
        </div>
      )}

      {/* Chat area */}
      <div className='flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6'>
        {Object.entries(groupMessagesByDate(displayedMessages)).map(([date, dateMessages]) => (
          <div key={date} className="mb-6">
            <div className="flex justify-center mb-4">
              <span className="bg-gray-800 text-gray-300 text-xs px-4 py-1 rounded-full">
                {date}
              </span>
            </div>
            {dateMessages.map((msg, index) => {
              let vibeInvite = null
              try {
                const parsed = JSON.parse(msg.text);
                if (parsed.type === "viberoom-invite") vibeInvite = parsed;
              } catch {
                // ignore JSON parse errors
              }
              return (
                <div key={index} className="group relative flex items-end gap-2 justify-end">
                  {/* Message Content */}
                  {vibeInvite ? (
                    <div className="bg-violet-600/30 p-2 rounded-lg mb-8">
                      <p>
                        <b>{vibeInvite.fromName}</b> invited you to a VibeRoom!
                      </p>
                      <a
                        href={`/viberoom/${vibeInvite.roomId}?video=${encodeURIComponent(vibeInvite.videoUrl)}`}
                        className="text-purple-400 underline"
                      >
                        Join & Watch Together
                      </a>
                    </div>
                  ) : msg.image ? (
                    <div className="relative">
                      <img
                        src={msg.image}
                        alt="Sent/Received"
                        className="w-40 h-40 object-cover rounded-lg cursor-pointer"
                      />
                      <Trash2
                        className="hidden group-hover:block absolute top-0 right-0 w-4 h-4 cursor-pointer text-red-500 hover:text-red-600"
                        onClick={() => setShowDeleteOptions(msg._id)}
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <p className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${
                        msg.senderId === authUser._id ? 'rounded-br-none' : 'rounded-bl-none'
                      }`}>
                        {msg.text}
                      </p>
                      <Trash2
                        className="hidden group-hover:block absolute top-0 right-0 w-4 h-4 cursor-pointer text-red-500 hover:text-red-600"
                        onClick={() => setShowDeleteOptions(msg._id)}
                      />
                    </div>
                  )}

                  {/* Delete options popup */}
                  {showDeleteOptions === msg._id && (
                    <div className={`absolute ${msg.senderId === authUser._id ? 'right-0' : 'left-0'} top-0 bg-gray-800 rounded-lg shadow-lg p-2 z-10`}>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 rounded"
                        onClick={() => setConfirmDelete({ show: true, messageId: msg._id, deleteFor: 'me' })}
                      >
                        Delete for me
                      </button>
                      {msg.senderId === authUser._id && (
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 rounded"
                          onClick={() => setConfirmDelete({ show: true, messageId: msg._id, deleteFor: 'everyone' })}
                        >
                          Delete for everyone
                        </button>
                      )}
                    </div>
                  )}

                  <div className='text-center text-xs'>
                    <img
                      src={msg.senderId === authUser._id
                        ? authUser?.profilePic || assets.avatar_icon
                        : selectedUser?.profilePic || assets.avatar_icon}
                      alt=""
                      className='w-7 rounded-full'
                    />
                    <p className='text-gray-500'>{formatMessageTime(msg.createdAt)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
        <div ref={scrollEnd}></div>
      </div>

      {/* Confirmation Dialog */}
      {confirmDelete.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backdropFilter: 'blur(5px)' }}>
          <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Delete Message</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this message
              {confirmDelete.deleteFor === 'everyone' ? ' for everyone' : ' for yourself'}?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Area */}
      <div className="w-full fixed bottom-0 left-0 bg-gray-900 p-3 flex items-center gap-2">
        <label className="cursor-pointer flex items-center">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleSendImage}
          />
          <ImageIcon className="w-7 h-7 text-gray-400 hover:text-white" />
        </label>
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSendMessage(e);
            }
          }}
          className="flex-1 py-2 px-4 border border-gray-700 rounded-full bg-gray-800 text-white placeholder-gray-400 text-sm"
        />
        <img
          onClick={handleSendMessage}
          src={assets.send_button}
          alt=""
          className="w-8 h-8 cursor-pointer"
        />
      </div>
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center gap-2 text-gray-300'>
      <img src={assets.logo_icon} alt="" className='max-w-16' />
      <p className='text-lg font-medium text-white'>🤘Where Vibes Connect, Conversations Begin.🤘</p>
    </div>
  )
}

export default ChatContainer