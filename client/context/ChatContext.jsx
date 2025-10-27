import { createContext, useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});
    const [friends, setFriends] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [receivedRequests, setReceivedRequests] = useState([]);

    const { socket, axios, authUser, onlineUsers } = useContext(AuthContext);

    // Get messages for selected user
    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Send message to selected user
    const sendMessage = async (messageData, receiverId) => {
        try {
            const { data } = await axios.post(`/api/messages/send/${receiverId}`, messageData);
            if (data.success) {
                setMessages((prevMessages) => [...prevMessages, data.newMessage]);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Subscribe to new messages
    const subscribeToMessages = () => {
        if (!socket) return;

        socket.on("newMessage", (newMessage) => {
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                newMessage.seen = true;
                setMessages(prev => [...prev, newMessage]);
                axios.get(`/api/messages/mark/${newMessage._id}`);
            } else {
                setUnseenMessages(prev => ({
                    ...prev,
                    [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1
                }));
            }
        });

        socket.on("messageDeleted", ({ messageId, deleteFor }) => {
            if (deleteFor === 'everyone') {
                setMessages(prev => prev.filter(msg => msg._id !== messageId));
            }
        });
    };

    const unsubscribeFromMessage = () => {
        if (socket) socket.off("newMessage");
    };

    useEffect(() => {
        subscribeToMessages();
        return () => unsubscribeFromMessage();
    }, [socket, selectedUser]);

    // Delete message
    const deleteMessage = async (messageId, deleteFor) => {
        try {
            const { data } = await axios.delete(`/api/messages/${messageId}`, {
                data: { deleteFor }
            });

            if (data.success) {
                if (deleteFor === 'everyone') {
                    setMessages(prev => prev.filter(msg => msg._id !== messageId));
                } else {
                    setMessages(prev => prev.map(msg =>
                        msg._id === messageId
                            ? { ...msg, deletedFor: [...(msg.deletedFor || []), authUser._id] }
                            : msg
                    ));
                }
                toast.success(`Message deleted ${deleteFor === 'everyone' ? 'for everyone' : 'for you'}`);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to delete message');
        }
    };

    // Get social data (friends, requests, etc)
    const getSocialData = async () => {
        try {
            const { data } = await axios.get("/api/auth/social");
            if (data.success) {
                setFriends(data.friends);
                setAllUsers(data.allUsers);
                setSentRequests(data.sentRequests);
                setReceivedRequests(data.receivedRequests);
                setUnseenMessages(data.unseenMessages || {});
            }
        } catch (error) {
            toast.error(error.message || "Failed to load social data");
        }
    };

    useEffect(() => {
        getSocialData();
    }, [onlineUsers]);

    const value = {
        messages, friends, allUsers, sentRequests, receivedRequests,
        selectedUser, getSocialData, getMessages, sendMessage, setSelectedUser, unseenMessages, setUnseenMessages, deleteMessage
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};