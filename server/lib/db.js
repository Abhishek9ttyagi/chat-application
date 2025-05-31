import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log('MongoDB Connected'));
        await mongoose.connect(`${process.env.MONGODB_URI}/HEART-CHAT`);
    } catch (error) {
        console.error(`Error: ${error}`);
    }
};
