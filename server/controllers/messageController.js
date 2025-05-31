import { add } from "three/tsl";
import Message from "../models/Message";
import cloudinary from "../lib/cloudinary";
import {io,userSocketMap} from "../lib/socket.js";

// Get all users except the logged-in user
export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");

        // Count number of messages not seen
        const unseenMessages = {};
        const promises = filteredUsers.map(async (user) => {
            const messages = await Message.find({senderId: user._id, receiverId: userId, seen: false});
            if(messages.length > 0) {
                unseenMessages[user._id] = messages.length;
            }
        });
        await Promise.all(promises);
        res.json({ success: true, users: filteredUsers , unseenMessages});
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
}

// get all message for selected user
export const getMessages = async( req, res)=>{
    try{
        const { id : selectecUserId } = req.params;
        const myId = req.user._Id;
        const messages = await Message.find({
            $or:[
                {senderId : myId, receiverId:selectecUserId}, 
                {senderId : selectecUserId, receiverId : myId}
            ]
        })
        await Message.updateMany({senderId:selectedUserId, recieverId:myId},
            {seen: true});
    }
    catch(error){
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
}


// api to mark message as seen using message id
export const markMessaageAsSeen = async ( req, res  )=>{
    try{
        const{id} = req.params;
        await Message .findByIdAndUpdate(id, { seen : true})
        res.json({success:true})
    }
    catch (error){
        console.log(error.message);
        req.json({success:false, message:error.message})
    }
}


// Send message to selected user
export const sendMeessage = async(req,res)=>{
    try{
        const{text,image} = req.body;
        const recieverId = req.param.id;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }
        const newMessage = await Message.create({
            senderId,
            recieverId,
            text, 
            image:imageUrl
        });
        // Emit the new message to the receiver's socket
        const receiverSocketId = userSocketMap[recieverId];
        if(receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }
        res.json({success:true, newMessage});
    } catch(error){
        console.log(error.message);
        res.json({success:false, message:error.message})
    }
}