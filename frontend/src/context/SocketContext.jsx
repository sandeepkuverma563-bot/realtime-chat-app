import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import API_BASE_URL from "../config/api";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user?._id) return;

    const newSocket = io(API_BASE_URL, {
      query: {
        userId: user._id,
      },
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};