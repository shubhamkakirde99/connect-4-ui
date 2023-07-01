import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Home() {
  const [userName, setUserName] = useState<string>();
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();

  const validateUsername = (newUsername: string) => {
    axios
      .get(`http://localhost:3001/check-user/${userName}`)
      .then((res) => console.log("axios res: ", res));
  };

  const updateUserName = (e: any) => {
    const newUsername = e.target.value;
    setUserName(newUsername);
    clearTimeout(timeoutId);
    setTimeoutId(
      setTimeout(() => {
        validateUsername(newUsername);
      }, 500)
    );
  };

  return (
    <React.Fragment>
      <input onChange={updateUserName}></input>
      <p>{userName}</p>
      <Link to="play">play</Link>
    </React.Fragment>
  );
}
