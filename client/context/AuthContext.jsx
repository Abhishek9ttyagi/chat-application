import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  

  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //login function to handle user login and socket connection
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.userData);
        connectSocket(data.userData);
        axios.defaults.headers.common["token"] = data.token;
        setToken(data.token);
        localStorage.setItem("token", data.token);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //logout function to handle user logout and disconnect socket
  const logout = async () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    axios.defaults.headers.common["token"] = null;
    toast.success("Logged out successfully");
    socket.disconnect();
  };

  //Update user function to handle user profile updates
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Delete account function
  const deleteAccount = async () => {
    try {
      const { data } = await axios.delete("/api/auth/delete-account");
      if (data.success) {
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        if (socket) socket.disconnect();
        toast.success("Account deleted successfully");
        // Optionally, redirect to login or home
        window.location.href = "/login";
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //connect socket function to handle socket connection and online users and updates
  const connectSocket = (userData) => {
    // if (!userData || socket.connected) return;
    if (!userData) return;
    if (socket && socket.connected) return;
    const newSocket = io(backendUrl, {
      query: {
        userId: userData._id,
      },
    });
    newSocket.connect();
    setSocket(newSocket);
    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
    }
    checkAuth();
  }, []);

  const value = {
    // Add authentication state and methods here
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
    deleteAccount,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
