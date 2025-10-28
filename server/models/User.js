import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email:{type: String,required:true,unique:true},
    fullName:{type:String,required:true},
    password:{type:String,required:true,minlength:6},
    profilePic:{type:String,default:""},
    bio:{type:String},
    contact:{type:String, default:""}, // e.g., phone or alternate contact
    additionalDetails:{type:String, default:""}, // free-form details
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    receivedRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
},{timestamps:true});

const User = mongoose.model("User",userSchema);

export default User; 