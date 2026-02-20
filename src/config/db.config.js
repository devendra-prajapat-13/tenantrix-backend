import mongoose from "mongoose";
import logger from "../logger.js";
export const dbconnect = async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        logger.info("connected to database");
    }
    catch(err){
       logger.error("error: ",err);
       logger.error("failed to connect mongodb");
       process.exit(1);
    }
}
