import mongoose from "mongoose";
import { min } from "three/tsl";

const userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    fullName: {type: String, required: true},
    password: {type: String, required: true, minlength: 6},
    profilePic: {type: String, default: "https://i.imgur.com/2Y8v1gk.png"},
    bio: {type: String, default: "Hey there! I'm using Heart Chat."},
}, {timestamps: true});

const User = mongoose.model("User", userSchema);

export default User;