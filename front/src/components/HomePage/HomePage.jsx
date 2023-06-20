import React, { useEffect, useRef } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideo, faKeyboard } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert";

import "./HomePage.scss";
import Header from "../UI/Header/Header";

function HomePage() {
  const navigate = useNavigate();
  const roomRef = useRef();
  const userRef = useRef();

  function clickJoin() {
    if (!roomRef.current.value || !userRef.current.value) {
      // alert("please fill the room and your name");
      return swal("Warning!", "Enter Room Name or User Name", "warning");
    }
    const roomName = roomRef.current.value;
    const userName = userRef.current.value;
    navigate(`${userName}/${roomName}/1/1`);
  }

  return (
    <div className="home-page">
      <Header />
      <div className="body">
        <div className="left-side">
          <div className="content">
            <button
              style={{
                background: "#7cd1f9",
                width: "410px",
                border: " 1px solid #ccc",
                borderRadius: "5px",
                fontSize: "30px",
                marginLeft: "22px",
                marginBottom: "60px",
              }}
              className="btn no-bg"
              onClick={clickJoin}
            >
              Join
            </button>

            <div className="action-btn">
              <div className="input-block">
                <div className="input-section">
                  <FontAwesomeIcon className="icon-block" icon={faKeyboard} />
                  <input placeholder="Username" ref={userRef} />
                </div>
                <div className="input-section">
                  <FontAwesomeIcon className="icon-block" icon={faKeyboard} />
                  <input placeholder="Room name" ref={roomRef} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="right-side">
          <div className="content">
            <img
              src="https://www.gstatic.com/meet/google_meet_marketing_ongoing_meeting_grid_427cbb32d746b1d0133b898b50115e96.jpg"
              alt="pic"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
