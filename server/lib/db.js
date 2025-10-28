import mongoose from "mongoose";

// Function to connect to the mongodb database

export const connectDB = async () =>{
    try{

         mongoose.connection.on('connected',()=> console.log('Database Connected'))

        // Use the URI as provided in the environment; include the DB name there
        // Examples:
        // - mongodb://localhost:27017/vibechat
        // - mongodb+srv://user:pass@cluster.mongodb.net/vibechat
        await mongoose.connect(process.env.MONGODB_URI)
    }catch (error) {
       console.log(error);
    }
} 