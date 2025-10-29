// ✅ Correct way (consistent casing)
import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from 'bcryptjs';


// SignUp a new user


export const signup = async (req,res)=>{
    const {fullName,email,password,bio} = req.body;

    try{
        if(!fullName || !email || !password || !bio ){
            return res.status(400).json({success:false,message:"Missing required fields"})
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if(!emailRegex.test(email)){
            return res.status(400).json({success:false,message:"Invalid email format"})
        }
        if(password.length < 6){
            return res.status(400).json({success:false,message:"Password must be at least 6 characters"})
        }
        const user = await User.findOne({email});

        if(user){
             return res.status(409).json({success:false,message:"Account already exists"});
        }
    
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = await User.create({
            fullName,email,password:hashedPassword,bio
        })

        const token = generateToken(newUser._id)
        res.status(201).json({success:true,userData:newUser,token,message:"Account created successfully"})

    } catch (error){
        console.log(error.message)
        res.status(500).json({success:false,message:"Failed to create account"}) 
    }
}


// Controller to login a user

export const login = async (req,res)=> {

    try{
         const {email,password} = req.body;
         if(!email || !password){
            return res.status(400).json({ success:false,message: "Email and password are required"});
         }
         const userData = await User.findOne({email})
         if(!userData){
            return res.status(401).json({ success:false,message: "Invalid credentials"});
         }

         const isPasswordCorrect = await bcrypt.compare(password,userData.password);

         if(!isPasswordCorrect){
            return res.status(401).json({ success:false,message: "Invalid credentials"});
         } 

         const token = generateToken(userData._id)

        res.json({success:true,userData,token,message:"Login successfully"})


    }catch(error){
        console.log(error.message)
         res.status(500).json({success:false,message:"Login failed"}) 
    }
}


// controller to check if user is authenticated

export const checkAuth = (req,res) => {
    res.json({success:true,user: req.user});
}

// Controller to update user profule details
export const updateprofile = async (req, res) => {
  try {
    const { profilePic, bio, fullName, contact, additionalDetails } = req.body; 
    const userId = req.user._id;

    let updatedUser;

    if (!profilePic) {
      //  assign it to updatedUser here
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { bio, fullName, contact, additionalDetails },
        { new: true }
      );
    } else {
      const upload = await cloudinary.uploader.upload(profilePic);
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: upload.secure_url, bio, fullName, contact, additionalDetails },
        { new: true }
      );
    }

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};

// Send friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const fromId = req.user._id;
    const { toId } = req.body;
    if (fromId.toString() === toId) return res.json({ success: false, message: "Cannot add yourself" });

    const toUser = await User.findById(toId);
    const fromUser = await User.findById(fromId);

    if (!toUser) return res.json({ success: false, message: "User not found" });
    if (fromUser.friends.includes(toId)) return res.json({ success: false, message: "Already friends" });
    if (fromUser.sentRequests.includes(toId)) return res.json({ success: false, message: "Request already sent" });

    fromUser.sentRequests.push(toId);
    toUser.receivedRequests.push(fromId);

    await fromUser.save();
    await toUser.save();

    res.json({ success: true, message: "Friend request sent" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Accept friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fromId } = req.body;

    const user = await User.findById(userId);
    const fromUser = await User.findById(fromId);

    if (!user || !fromUser) return res.json({ success: false, message: "User not found" });

    // Remove from requests
    user.receivedRequests = user.receivedRequests.filter(id => id.toString() !== fromId);
    fromUser.sentRequests = fromUser.sentRequests.filter(id => id.toString() !== userId.toString());

    // Add to friends
    user.friends.push(fromId);
    fromUser.friends.push(userId);

    await user.save();
    await fromUser.save();

    res.json({ success: true, message: "Friend request accepted" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Reject friend request
export const rejectFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fromId } = req.body;

    const user = await User.findById(userId);
    const fromUser = await User.findById(fromId);

    if (!user || !fromUser) return res.json({ success: false, message: "User not found" });

    // Remove from requests
    user.receivedRequests = user.receivedRequests.filter(id => id.toString() !== fromId);
    fromUser.sentRequests = fromUser.sentRequests.filter(id => id.toString() !== userId.toString());

    await user.save();
    await fromUser.save();

    res.json({ success: true, message: "Friend request rejected" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get social data (friends, requests, all users for search)
export const getSocialData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("friends", "-password")
      .populate("sentRequests", "-password")
      .populate("receivedRequests", "-password");
    const allUsers = await User.find({ _id: { $ne: req.user._id } }).select("-password");
    res.json({
      success: true,
      friends: user.friends,
      sentRequests: user.sentRequests,
      receivedRequests: user.receivedRequests,
      allUsers
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
