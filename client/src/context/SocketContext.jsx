import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    let newSocket;
    if (user) {
      const defaultUrl = `http://${window.location.hostname}:5000`;
      newSocket = io(import.meta.env.VITE_SERVER_URL || defaultUrl);
      setSocket(newSocket);
    }

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
