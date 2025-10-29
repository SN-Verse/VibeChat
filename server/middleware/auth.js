// Middleware to protect routes

import User from "../models/User.js";
 import jwt from "jsonwebtoken"; // ✅ You need this!

export const protectRoute = async (req,res,next)=>{
    try{
        // Support both custom `token` header and standard Authorization: Bearer <token>
        let token = req.headers.token;
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (!token && authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring('Bearer '.length).trim()
        }

        if(!token){
            return res.status(401).json({success:false,message:"Authentication token missing"});
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET)

        const user = await User.findById(decoded.userId).select("-password");

        if(!user) return res.status(401).json({success:false,message:"User not found"});

        req.user = user;
        next();

    }catch(error){
       if (error?.name === 'TokenExpiredError' || error?.name === 'JsonWebTokenError'){
           return res.status(401).json({success:false,message:"Invalid or expired token"});
       }
       res.status(500).json({success:false,message:"Authentication failed"});
    }
}
  