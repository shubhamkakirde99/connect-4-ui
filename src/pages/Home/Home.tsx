import React, { MutableRefObject, useRef, useState } from "react";

import axios from "axios";
import Game from "../Game/Game";
import "./home.scss";
import {Box, Button, Container, Tab, Tabs, TextField, Typography} from "@mui/material";

const CREATE_GAME_KEY = "create";
const JOIN_GAME_KEY = "join";
const BOT_GAME_KEY = "bot";

const TAB_FUNCTIONALITY_MAP: {[tabIndex: number]: string} = {
  0: CREATE_GAME_KEY,
  1: JOIN_GAME_KEY,
  2: BOT_GAME_KEY,
};

const isCreateGame = (tabNumber: number) => {
  return TAB_FUNCTIONALITY_MAP[tabNumber] === CREATE_GAME_KEY;
}
const isJoinGame = (tabNumber: number) => {
  return TAB_FUNCTIONALITY_MAP[tabNumber] === JOIN_GAME_KEY;
}
const isBotGame = (tabNumber: number) => {
  return TAB_FUNCTIONALITY_MAP[tabNumber] === BOT_GAME_KEY;
}

const Home = () => {
  const [userName, setUserName] = useState<string>("");
  const [roomName, setRoomName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [infoMessage, setInfoMessage] = useState<string>("");
  const [preGame, setPreGame] = useState<boolean>(true);
  const [opponentName, setOpponentName] = useState<string>("");
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
  const [showWaitingText, setShowWaitingText] = useState<boolean>(false);
  const [tabSwitchEnabled, setTabSwitchEnabled] = useState<boolean>(true);
  const [opponentDisconnected, setOpponentDisconnected] = useState<boolean>(false);

  const socketRef = useRef<WebSocket>();

  const handleRoomCreated = (data: any) => {
    const rn = data.payload.roomName;
    setTabSwitchEnabled(false);
    setRoomName(rn);
    setErrorMessage("");
    setInfoMessage(
      `Room with name ${rn} has been created. Wait for others to join`
    );
  };

  const handleClickPlay = () => {
    if (!checkValidUserName(userName)) {
      setErrorMessage("Please Enter a Valid Username");
      return;
    }

    let socketUrl = `${process.env.REACT_APP_WEBSOCKET_SECURITY}://${process.env.REACT_APP_BACKEND_HOSTNAME}/ws?userName=${userName}&type=create`;
    if (!isCreateGame(selectedTabIndex)) {
      checkRoomExists(roomName).then(response => {
        if (response.data === false) {
          setErrorMessage(`Room Name ${roomName} Does Not Exist`);
        } else {
          socketUrl = `${process.env.REACT_APP_WEBSOCKET_SECURITY}://${process.env.REACT_APP_BACKEND_HOSTNAME}/ws?userName=${userName}&roomName=${roomName}&type=join`;
          connectWebSocket(socketUrl);
        }
      })
    } else if (!roomName) {
      connectWebSocket(socketUrl);
    }
  };

  const connectWebSocket = (socketUrl: string) => {
    socketRef.current = new WebSocket(socketUrl);
    socketRef.current.onopen = (e: any) => {
      console.log("home - [open] Connection established");
      console.log("home - Sending to server");
    };

    socketRef.current.onclose = (event: any) => {
      // TODO - handle socket close
      console.log("on close")
    };
    socketRef.current.onerror = (error: any) => {
      console.log("error handler")
    };

    socketRef.current?.addEventListener("message", (event: any) => {
      const data = JSON.parse(event?.data);
      console.log(`home - [message] Data received from server: ${data}`);
      if (data?.type === "room_created") {
        handleRoomCreated(data);
      } else if (data?.type === "player_joined") {
        setOpponentName(data?.payload?.opponent);
      } else if (data?.type === "game_start") {
        setPreGame(false);
        sessionStorage.setItem("player", isCreateGame(selectedTabIndex) ? "1" : "2");
      } else if (data?.type === "opponent_disconnected") {
        setOpponentDisconnected(true);
      }
    });
  }

  const updateUserName = (e: any) => {
    const newUsername = e.target.value;
    setUserName(newUsername);
  };

  const checkValidUserName = (name: string): boolean => {
    return name.length > 0;
  };

  const checkRoomExists = (checkRoomName: string) => {
    return axios.get(
        `${process.env.REACT_APP_REST_SECURITY}://${process.env.REACT_APP_BACKEND_HOSTNAME}/room-exists/${checkRoomName}`
    );
  };


  const handleRoomChange = (e: any) => {
    setRoomName(e.target.value);
  };

  const handleTabChange = (e: React.SyntheticEvent, newValue: number) => {
    setErrorMessage("");
    setSelectedTabIndex(newValue);
  }

  return (
    <div id="main-screen">
      {/*<Typography align="center" variant="h2" sx={{color: "yellow"}}>Apologies, I ran out of free tier (750 hours). Backend shall be restored in August.</Typography>*/}
      <div id="stars"></div>
      <div id="stars2"></div>
      <div id="stars3"></div>
      {preGame ? (
        <Container
          sx={{
            display: "flex",
            marginTop: "30vh",
            justifyContent: "center",
            minHeight: "75vh",
          }}
        >
          <Box sx={{width: 3/4}}>
            <Tabs variant="fullWidth" value={selectedTabIndex} onChange={handleTabChange}>
              <Tab disabled={!tabSwitchEnabled} label="Create New Room" />
              <Tab disabled={!tabSwitchEnabled} label="Join a Room" />
              <Tab disabled={!tabSwitchEnabled} label="Play Against a Bot" />
            </Tabs>
            <Box sx={{
              display: "flex",
              flexDirection: "column"
            }}>
              {
                !isBotGame(selectedTabIndex) &&
                  <TextField
                      label="Your Name"
                      variant="standard"
                      onChange={updateUserName}
                  />
              }
              {
                isJoinGame(selectedTabIndex) &&
                  <TextField
                    label="Room Name"
                    variant="standard"
                    onChange={handleRoomChange}
                />
              }
              {
                isBotGame(selectedTabIndex) &&
                  <Typography align="center" variant="h4">
                    Coming Soon!
                  </Typography>
              }
              {
                  !showWaitingText && !isBotGame(selectedTabIndex)  &&
                  <Button onClick={handleClickPlay}>Play</Button>
              }
            </Box>
            <Box>
              {errorMessage && <Typography align="center" variant="h6" sx={{color: "red"}}>{errorMessage}</Typography>}
              {infoMessage && <Typography align="center" variant="h6" sx={{color: "yellow"}}>{infoMessage}</Typography>}
            </Box>

          </Box>
        </Container>
      ) : (
        <React.Fragment>
          {
            opponentDisconnected &&
              <Typography align="center" sx={{color: "yellow"}}>Opponent has disconnected. Please wait for them to reconnect.</Typography>
          }
          <Typography align="center">{userName} <small>(you)</small> VS {opponentName}</Typography>
          <Game socketRef={socketRef as MutableRefObject<WebSocket>} />
        </React.Fragment>
      )}
    </div>
  );
};

export default Home;
