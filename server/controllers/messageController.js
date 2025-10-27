// Get all users exept the logged in user

import Message from "../models/message.js";
import cloudinary from "../lib/cloudinary.js";
import User from "../models/User.js";
import {io,userSocketMap} from "../server.js"

export const getUsersForSidebar = async(req,res)=>{
    try{
    const userId = req.user._id;
    const fileteredUsers = await User.find({_id: {$ne:userId}}).select("-password");
    
    // Count number of messages not seen

    const unseenMessages= {}
    const promises = fileteredUsers.map(async(user)=>{
        const messages=await Message.find({senderId:user.id,receiverId:userId,seen:false})
        if(messages.length>0){
            unseenMessages[user._id]=messages.length;
        }
    })
    await Promise.all(promises);
    res.json({success:true,users:fileteredUsers,unseenMessages})
    } catch(error){
        console.log(error.message)
        res.json({success:false,message:error.message})

    }
}

// get all messages for selected user

export const getMessages = async(req,res)=>{
    try{
        const {id:selectedUserId}=req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or:[
                {senderId: myId, receiverId: selectedUserId},
                {senderId: selectedUserId, receiverId: myId},
            ]
        })
        await Message.updateMany(
            {senderId: selectedUserId, receiverId: myId},
            {seen: true}
        );
        
        res.json({success:true, messages})

    }catch(error){
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}

// api to mark the messages seen using message id 

export const markMessageAsSeen = async (req,res)=>{
    try{
        const {id} = req.params;
        await Message.findByIdAndUpdate(id,{seen:true})
        res.json({success:true})
    } catch (error){
        console.log(error.message);
        res.json({success: false,message:error.message})
    } 
}

// Send message to selected user

export const sendMessage = async (req,res)=>{
    try {
        const {text,image}=req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
           const uploadResponse = await cloudinary.uploader.upload(image)
           imageUrl = uploadResponse.secure_url;
        }
        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image:imageUrl
        })

        // Emit the new message to the receiver's socket
        const receiverSocketId = userSocketMap[receiverId];
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage",newMessage)
        }

        res.json({success:true,newMessage});
        
    } catch (error) {
          console.log(error.message);
        res.json({success: false,message:error.message})
    }
}

// Add this function at the bottom of the file

export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { deleteFor } = req.body;
        const userId = req.user._id;

        console.log('Delete params:', { messageId, deleteFor, userId }); // Debug log

        const message = await Message.findById(messageId);
        
        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }

        if (deleteFor === 'everyone') { 
            if (message.senderId.toString() !== userId.toString()) {
                return res.status(403).json({ success: false, message: "Unauthorized" });
            }
            await Message.findByIdAndDelete(messageId);
        } else {
            await Message.findByIdAndUpdate(messageId, {
                $addToSet: { deletedFor: userId }
            });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

