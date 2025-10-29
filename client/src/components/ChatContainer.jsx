import React, { useContext, useEffect, useRef, useState } from 'react'
import assets from '../assets/assets'
import { formatMessageTime } from '../lib/utils'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Trash2, Search, Image as ImageIcon, Pencil } from 'lucide-react'
import { formatDateForGrouping } from "../utils/formatDate"


const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage: contextSendMessage, getMessages, deleteMessage, typingUsers, sendTypingStatus } = useContext(ChatContext)
  const { authUser, onlineUsers } = useContext(AuthContext)
  const scrollEnd = useRef()
  const [input, setInput] = useState('')
  const [showDeleteOptions, setShowDeleteOptions] = useState(null)
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [confirmDelete, setConfirmDelete] = useState({ show: false, messageId: null, deleteFor: null })
  const typingTimeoutRef = useRef(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const [editState, setEditState] = useState({ messageId: null, text: '' })

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target
    // Consider within a small threshold as bottom to avoid off-by-1 with images/fonts
    const delta = scrollHeight - scrollTop - clientHeight
    const isAtBottom = delta <= 16
    setAutoScroll(isAtBottom)
  }

  useEffect(() => {
    if (selectedUser) getMessages(selectedUser._id)
  }, [selectedUser, getMessages])

  const scrollToBottom = () => {
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  useEffect(() => {
    if (autoScroll) {
      scrollToBottom()
    }
  }, [messages, autoScroll])

  // No stateful cache for search results; derive from messages for real-time updates

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

  const canEditMessage = (msg) => {
    if (!msg || msg.senderId !== authUser._id) return false
    if (!msg.text || msg.image) return false
    const created = new Date(msg.createdAt).getTime()
    return Date.now() - created <= 2 * 60 * 1000
  }

  // Derive displayed messages directly so new messages instantly reflect in results
  const displayedMessages = searchTerm
    ? messages.filter(m => m.text && m.text.toLowerCase().includes(searchTerm.toLowerCase()))
    : messages

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    await contextSendMessage({ text: input.trim() }, selectedUser._id)
    setInput("")
    // stop typing on send
    sendTypingStatus(selectedUser._id, false)
  }

  // Send image
  const handleSendImage = async (e) => {
    const file = e.target.files && e.target.files[0]
    const resetInput = () => { try { e.target.value = "" } catch(_){} }
    if (!file) return

    // Strict client-side validation (covers browsers that loosely honor accept="image/*")
    const maxBytes = 5 * 1024 * 1024 // 5MB
    const allowedExt = [".png", ".jpg", ".jpeg", ".gif", ".webp"]
    const nameLower = (file.name || "").toLowerCase()
    const hasAllowedExt = allowedExt.some(ext => nameLower.endsWith(ext))
    const isImageMime = typeof file.type === 'string' && file.type.startsWith("image/")

    if (!isImageMime || !hasAllowedExt) {
      toast.error("Please select a valid image (png, jpg, jpeg, gif, webp)")
      resetInput()
      return
    }
    if (file.size > maxBytes) {
      toast.error("Image too large. Max 5MB.")
      resetInput()
      return
    }

    const reader = new FileReader()
    reader.onloadend = async () => {
      try {
        await contextSendMessage({ image: reader.result }, selectedUser._id)
      } finally {
        resetInput()
      }
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
        <img src={selectedUser.profilePic || assets.avatar_icon} alt={`${selectedUser.fullName} avatar`} className='w-8 rounded-full' />
        <p className='flex-1 text-lg text-white flex items-center gap-2'>
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && <span className='w-2 h-2 rounded-full bg-green-500'></span>}
        </p>
        {typingUsers[selectedUser._id] && (
          <span className='text-xs text-gray-400'>typing…</span>
        )}
        <Search
          className="w-5 h-5 cursor-pointer text-gray-400 hover:text-white"
          onClick={() => setShowSearch((prev) => !prev)}
        />
        <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} alt="Back" className='md:hidden max-w-7' />
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
      <div
        className='flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6'
        onScroll={handleScroll}
      >
        {authUser && selectedUser && Object.entries(groupMessagesByDate(displayedMessages)).map(([date, dateMessages]) => (
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
                <div key={index} className={`group relative flex items-end gap-2 mb-2 ${msg.senderId === authUser._id ? 'justify-end' : 'justify-start'}`}> 
                  {/* Message Content */}
                  {vibeInvite ? (
                    <div className="bg-violet-600/30 p-2 rounded-lg mb-8">
                      <p>
                        <b>{vibeInvite.fromName}</b> invited you to a VibeRoom!
                      </p>
                      <a
                        href={`/viberoom/${vibeInvite.roomId}?v=${btoa(encodeURIComponent(vibeInvite.videoUrl))}`}
                        className="text-purple-400 underline"
                      >
                        Join & Watch Together
                      </a>
                    </div>
                  ) : msg.image ? (
                    <div className="relative">
                      <img
                        src={msg.image}
                        alt="Chat image"
                        className="w-40 h-40 object-cover rounded-lg cursor-pointer"
                        onLoad={() => { if (autoScroll) scrollToBottom() }}
                      />
                      <Trash2
                        className="hidden group-hover:block absolute top-0 right-0 w-4 h-4 cursor-pointer text-red-500 hover:text-red-600"
                        onClick={() => setShowDeleteOptions(msg._id)}
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      {editState.messageId === msg._id ? (
                        <div className={`p-2 max-w-[280px] rounded-lg ${msg.senderId === authUser._id ? 'bg-violet-500/20' : 'bg-gray-700/40'}`}>
                          <textarea
                            className="w-full bg-transparent outline-none text-white text-sm resize-none"
                            rows={2}
                            value={editState.text}
                            onChange={(e) => setEditState(s => ({ ...s, text: e.target.value }))}
                          />
                          <div className="flex gap-2 mt-2 text-xs">
                            <button
                              className="px-3 py-1 rounded bg-violet-600 hover:bg-violet-700"
                              onClick={async () => {
                                const trimmed = (editState.text || '').trim()
                                if (!trimmed) return toast.error('Message cannot be empty')
                                await editMessage(editState.messageId, trimmed)
                                setEditState({ messageId: null, text: '' })
                              }}
                            >Save</button>
                            <button
                              className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600"
                              onClick={() => setEditState({ messageId: null, text: '' })}
                            >Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className={`p-2 max-w-[250px] md:text-sm font-light rounded-lg break-all text-white ${
                              msg.senderId === authUser._id
                                ? 'bg-violet-500/30 rounded-br-none self-end'
                                : 'bg-gray-700/40 rounded-bl-none self-start'}`}>
                            {msg.text}
                            {msg.edited && <span className="ml-2 text-[10px] text-gray-400">(edited)</span>}
                          </p>
                          <Trash2
                            className="hidden group-hover:block absolute top-0 right-0 w-4 h-4 cursor-pointer text-red-500 hover:text-red-600"
                            onClick={() => setShowDeleteOptions(msg._id)}
                          />
                          {/* Message delivery status indicator */}
                          {msg.senderId === authUser._id && (
                            <div className="absolute -right-10 bottom-1 flex items-center gap-0.5 text-[10px] text-gray-400 animate-fade-in">
                              <span className={msg.seen ? 'text-blue-400' : 'text-gray-500'}>
                                {msg.seen ? '✓✓' : '✓'}
                              </span>
                            </div>
                          )}
                        </>
                      )}
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
                      {canEditMessage(msg) && (
                        <button
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 rounded mt-1"
                          onClick={() => {
                            setShowDeleteOptions(null)
                            setEditState({ messageId: msg._id, text: msg.text || '' })
                          }}
                        >
                          <Pencil className="w-4 h-4" /> Edit message
                        </button>
                      )}
                    </div>
                  )}

                  <div className='text-center text-xs'>
                    <img
                      src={msg.senderId === authUser._id
                        ? authUser?.profilePic || assets.avatar_icon
                        : selectedUser?.profilePic || assets.avatar_icon}
                      alt={msg.senderId === authUser._id ? `${authUser.fullName} avatar` : `${selectedUser.fullName} avatar`}
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
          onChange={(e) => {
            const val = e.target.value
            setInput(val)
            if (!selectedUser) return
            // emit typing start and debounce stop
            sendTypingStatus(selectedUser._id, true)
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
            typingTimeoutRef.current = setTimeout(() => {
              sendTypingStatus(selectedUser._id, false)
            }, 900)
          }}
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
          alt="Send"
          className="w-8 h-8 cursor-pointer"
        />
      </div>
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center gap-2 text-gray-300'>
      <img src={assets.logo_icon} alt="VibeChat logo" className='max-w-16' />
      <p className='text-lg font-medium text-white'>🤘Where Vibes Connect, Conversations Begin.🤘</p>
    </div>
  )
}

export default ChatContainer