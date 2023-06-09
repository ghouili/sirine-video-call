import React, { useEffect, useState, useRef, useContext } from "react";
// import socket from "../../../Socket";
import "./Messenger.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faUserFriends,
  faCommentAlt,
  faPaperPlane,
  faPaperclip,
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import axios from "axios";
import swal from "sweetalert";
import streamSaver from "streamsaver";
import { SocketContext } from "../../../Context/SocketContext";
import { socket } from "../../../Socket";
import { useParams } from "react-router-dom";

function Messenger({
  setIsMessenger,
  display,
  roomId,
  peers,
  fileNameRef,
  gotFile,
  setGotFile,
}) {
  const params = useParams();
  const { setIsLoading } = useContext(SocketContext);
  let time = moment(new Date()).format("hh:mm A");
  const [chat, setChat] = useState([]);
  const [text, setText] = useState("");
  // const [file, setFile] = useState(null);
  let path = "http://localhost:5000";
  const messagesEndRef = useRef(null);

  // File RElaited:
  const [file, setFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [isFileValid, setIsFileValid] = useState(false);
  const FilePickerRef = useRef();

  useEffect(() => {
    if (file) {
      // console.log("file :");
      // console.log(file.name);
      setText(file.name);
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setFilePreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  }, [file]);

  const handleFilePick = (event) => {
    let pickedFile;
    let fileIsValid = isFileValid;
    if (event.target.files && event.target.files.length === 1) {
      pickedFile = event.target.files[0];
      setFile(pickedFile);
      setIsFileValid(true);
      fileIsValid = true;
    } else {
      setIsFileValid(false);
      fileIsValid = false;
    }
    /* props.onInput(props.id, pickedFile, fileIsValid); */
  };

  useEffect(() => {
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

  // Scroll to Bottom of Message List
  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    setIsLoading(true);
    let sender = localStorage.getItem("name");

    if (file) {
      const formData = new FormData();
      formData.append("pdf", file);
      let url = `${path}/uploadFile`;
      let result = await axios.post(url, formData);

      if (result.data.success === true) {
        return socket.timeout(5000).emit(
          "send-message",
          {
            roomId: params.id,
            sender,
            message: `${path}/uploads/files/${result.data.data}`,
            time,
            isFile: true,
          },
          () => {
            setIsLoading(false);
            setIsFileValid(false); // Reset isFileValid state
            setFile(null);
            setFilePreviewUrl(null);
            setText("");
          }
        );
      } else {
        return swal("Error!", result.data.message, "error");
      }
    } else {
      socket
        .timeout(5000)
        .emit(
          "send-message",
          { roomId: params.id, sender, message: text, time, isFile: false },
          () => {
            setIsLoading(false);
            setIsFileValid(false); // Reset isFileValid state
            setFile(null);
            setFilePreviewUrl(null);
            setText("");
          }
        );
    }
  };

  return (
    <div className="messenger-container">
      <div className="messenger-header">
        <h3>Meeting details</h3>
        <FontAwesomeIcon
          className="icon"
          icon={faTimes}
          onClick={() => {
            setIsMessenger(false);
          }}
        />
      </div>

      <div className="messenger-header-tabs">
        <div className="tab">
          <FontAwesomeIcon className="icon" icon={faUserFriends} />
          <p>People (1)</p>
        </div>
        <div className="tab active">
          <FontAwesomeIcon className="icon" icon={faCommentAlt} />
          <p>Chat</p>
        </div>
      </div>

      <div className="chat-section">
        {chat.map(({ sender, message, time, isFile }, idx) => (
          <div key={idx} className="chat-block">
            <div className="sender">
              {sender} <small>{time}</small>
            </div>
            {isFile ? (
              <a
                href={message}
                download
                className="msg text-blue-700 underline hover:text-blue-800"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download File
              </a>
            ) : (
              <p className="msg">{message}</p>
            )}
          </div>
        ))}

        {gotFile && (
          <div>
            <span>
              You have received a file. Would you like to download the file?
            </span>
            <button onClick={() => alert("downloading...")}>Yes</button>
          </div>
        )}

        <div style={{ float: "left", clear: "both" }} ref={messagesEndRef} />
      </div>

      <div className="send-msg-section">
        <input
          placeholder="Send a message to everyone"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="w-fit">
          <input
            type="file"
            name="file"
            className="hidden"
            accept=".pdf"
            ref={FilePickerRef}
            onChange={handleFilePick}
            id="attache_file"
          />
          <label htmlFor="attache_file" className="cursor-pointer">
            <FontAwesomeIcon className="icon" icon={faPaperclip} />
          </label>
        </div>
        <div onClick={sendMessage}>
          <FontAwesomeIcon className="icon" icon={faPaperPlane} />
        </div>
      </div>
    </div>
  );
}

export default Messenger;
