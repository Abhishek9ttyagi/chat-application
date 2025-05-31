import User from "../models/User.js";
import bcrypt from "bcrypt";
import { generateToken } from "../lib/utils.js";
import jwt from "jsonwebtoken";
import cloudinary from "../lib/cloudinary.js";


//Signup a new user
export const signup = async (req, res) => {
    const {email, fullName, password} = req.body;
    try {
        if(!email || !fullName || !password || !bio) {
            return res.json({success: false, message: "Please fill all the fields"});
        }
        const user = await User.findOne({email});
        if(user) {
            return res.json({success: false, message: "User already exists"});
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create({
            fullName, email, password: hashedPassword, bio
        });
        const token = generateToken(newUser._id);
        res.json({success: true, userData: newUser, token, message: "User created successfully"});
        
    } catch (error) {
        console.error(error.message); 
        res.json({success: false, message: error.message});
    }
};


//Login a user
export const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});
        
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect) {
            return res.json({success: false, message: "Invalid credentials"});
        }
        const token = generateToken(user._id);
        res.json({success: true, userData, token, message: "User logged in successfully"});
    } catch (error) {
        console.error(error.message);
        res.json({success: false, message: error.message});
    }
};

// controller to check if user is authenticated

export const checkAuth = (req,res)=>{
    res.json({success:true, user:req.user});
}

// controller to update user profile details
export const updateProfile = async (req, res) => {
    try {
        const {profilepic, bio, fullName} = req.body;
        const userId = req.user._id;
        let updatedUser;
        if(!profilepic) {
            updatedUser = await User.findByIdAndUpdate(userId, {bio, fullName}, {new: true});
        }
        else {
            upload = await cloudinary.uploader.upload(profilepic, {
                folder: "HEART-CHAT",
                width: 150,
                height: 150,
                crop: "fill"
            });
            updatedUser = await User.findByIdAndUpdate(userId, {profilepic:upload.secure_url, bio, fullName}, {new: true});
        }
        res.json({success: true, user: updatedUser, message: "Profile updated successfully"});
    } catch (error) {
        console.error(error.message);
        res.json({success: false, message: error.message});
    }
};