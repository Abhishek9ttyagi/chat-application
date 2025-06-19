import jwt from "jsonwebtoken";

//fucntion to generate a token
export const generateToken = (userId) => {
    // const token = jwt.sign({userId}, process.env.JWT_SECRET);
    // return token;
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};