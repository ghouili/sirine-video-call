import React, { createContext, useState, useEffect } from "react";
import { socket } from "../Socket";
import { useLocation, useNavigate } from "react-router-dom";

const SocketContext = createContext();

const ProvideContext = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [chat, setChat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [me, setMe] = useState('')

  useEffect(() => {
    socket.on('me', (id) => {
      console.log(id);
      setMe(id);
    });
      socket.on("receive-message", ({ sender, message, time, isFile }) => {
        console.log(chat);
        setChat((chat) => [...chat, { message, sender, time, isFile }]);
      });
  
      return () => {
        // BAD: this will remove all listeners for the 'foo' event, which may
        // include the ones registered in another component
        socket.off("receive-message");
      };
  }, []);
  // useEffect(() => {
  //   // listening on incomming messages ::
  //   console.log('here 01');
  //   socket.on("FE-receive-message", ({ msg, sender, time }) => {
  //     console.log('here 02');
  //     setChat((chat) => [...chat, { msg, sender, time }]);
  //     // console.log(chat);
  //   });
  //   console.log('here 03');
  // }, []);

  return (
    <SocketContext.Provider value={{ isLoading, setIsLoading, me, chat, setChat }}>{children}</SocketContext.Provider>
  );
};
export { SocketContext, ProvideContext };
