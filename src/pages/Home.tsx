import React, { MutableRefObject, useRef, useState } from "react";

import axios from "axios";
import Game from "./Game";

const Home = () => {
  const [userName, setUserName] = useState<string>("");
  const [isCreate, setIsCreate] = useState<boolean>(false);
  const [roomName, setRoomName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [infoMessage, setInfoMessage] = useState<string>("");
  const [preGame, setPreGame] = useState<boolean>(true);
  const [opponentName, setOpponentName] = useState<string>("");

  const socketRef = useRef<WebSocket>();

  const handleRoomCreated = (data: any) => {
    const rn = data.payload.roomName;
    setRoomName(rn);
    setInfoMessage(
      `Room with name ${rn} has been created. Wait for others to join`
    );
  };

  const handleClickPlay = () => {
    if (!checkValidUserName(userName)) {
      setErrorMessage("Please Enter a Valid Username");
      return;
    }

    if (!isCreate && !checkRoomExists(roomName)) {
      setErrorMessage(`Room Name ${roomName} Does Not Exist`);
      return;
    }

    let socketUrl = `${process.env.REACT_APP_WEBSOCKET_SECURITY}://${process.env.REACT_APP_BACKEND_HOSTNAME}/ws?userName=${userName}&roomName=${roomName}&type=join`;

    if (isCreate) {
      socketUrl = `${process.env.REACT_APP_WEBSOCKET_SECURITY}://${process.env.REACT_APP_BACKEND_HOSTNAME}/ws?userName=${userName}&type=create`;
    }

    socketRef.current = new WebSocket(socketUrl);
    socketRef.current.onopen = (e: any) => {
      console.log("home - [open] Connection established");
      console.log("home - Sending to server");
    };

    socketRef.current.onclose = (event: any) => {
      // TODO - add close handling
    };
    socketRef.current.onerror = (error: any) => {
      // TODO - add error handling
    };

    socketRef.current.onmessage = (event: any) => {
      const data = JSON.parse(event?.data);
      console.log(`home - [message] Data received from server: ${data}`);
      if (data?.type === "room_created") {
        handleRoomCreated(data);
      } else if (data?.type === "player_joined") {
        setOpponentName(data?.payload?.opponent);
      } else if (data?.type === "game_start") {
        setPreGame(false);
        localStorage.setItem("player", isCreate ? "1" : "2");
      }
    };
  };

  const updateUserName = (e: any) => {
    const newUsername = e.target.value;
    setUserName(newUsername);
  };

  const checkValidUserName = (name: string): boolean => {
    return name.length > 0;
  };

  const checkRoomExists = async (checkRoomName: string) => {
    const roomExistsResponse = await axios.get(
      `${process.env.REACT_APP_REST_SECURITY}://${process.env.REACT_APP_BACKEND_HOSTNAME}/room-exists/${checkRoomName}`
    );
    return await roomExistsResponse?.data;
  };

  const joinGame = () => {
    setIsCreate(false);
  };

  const createGame = () => {
    setIsCreate(true);
  };

  const handleRoomChange = (e: any) => {
    setRoomName(e.target.value);
  };

  return (
    <React.Fragment>
      {preGame ? (
        <React.Fragment>
          <button onClick={joinGame}>Join a Game</button>
          <button onClick={createGame}>Create a Game</button>
          <br />
          <input
            placeholder="Enter Your Name"
            onChange={updateUserName}
          ></input>
          <br />
          {!isCreate && (
            <input
              placeholder="Enter Room Name"
              onChange={handleRoomChange}
            ></input>
          )}
          <br />
          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
          {infoMessage && <p style={{ color: "blue" }}>{infoMessage}</p>}
          <button onClick={handleClickPlay}>Play</button>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <h2>
            {userName} VS {opponentName}
          </h2>
          <Game socketRef={socketRef as MutableRefObject<WebSocket>} />
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default Home;
