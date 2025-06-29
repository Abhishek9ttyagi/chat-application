import { createContext, useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import toast from 'react-hot-toast';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});
    const { socket, axios } = useContext(AuthContext);

    // Function to get all users for sidebar
    const getUsers = async () => {
        try {
            const { data } = await axios.get("/api/messages/users");
            if (data.success) {
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages);
            } else {
                console.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    // Function to get messages for a selected user
    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages);
                // setSelectedUser(userId);
                const userObj = users.find(u => u._id === userId);
                setSelectedUser(userObj);
            } else {
                console.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    // Function to send a message to selected user
    const sendMessage = async (messageData) => {
        if (!selectedUser || !selectedUser._id) {
            toast.error("No user selected");
            return;
        }
        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
            if (data.success) {
                setMessages((prevMessages) => [...prevMessages, data.newMessage]);
                // socket.emit("sendMessage", { userId: selectedUser._id, message: data.newMessage });
                if (socket) {
                    socket.emit("sendMessage", { userId: selectedUser._id, message: data.newMessage });
                }
            } else {
                console.error(data.message);
            }
        } catch (error) {
             toast.error(error.response?.data?.message || error.message);
        }
    }

    // Function to subscribe to messages for selected user
    const subscribeToMessages = (userId) => {
        if (!socket) return;
        socket.on("newMessage", (newMessage) => {
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                newMessage.seen = true; // Mark as seen if it's the selected user
                setMessages((prevMessages) => [...prevMessages, newMessage]);
                axios.post(`/api/messages/mark/${newMessage._id}`)
            } else {
                // If it's not the selected user, update unseen messages count
                setUnseenMessages((prevUnseenMessages) => ({
                    ...prevUnseenMessages,
                    [newMessage.senderId]: prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
                }));
            }
        });
    }

    //function to unsubscribe from messages.
    const unsubscribeFromMessages = () => {
        if (socket) socket.off("newMessage");
    }

    useEffect(() => {
        subscribeToMessages();
        return () => unsubscribeFromMessages();
    }, [socket, selectedUser])

    const value = {
        messages, users, selectedUser, getUsers, getMessages, sendMessage, setSelectedUser,
        unseenMessages, setUnseenMessages
    }

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
}