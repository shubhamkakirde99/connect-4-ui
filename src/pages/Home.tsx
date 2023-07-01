import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [userName, setUserName] = useState<string>();

  const updateUserName = (e: any) => {
    setUserName(e.target.value);
  };

  return (
    <React.Fragment>
      <input onChange={updateUserName}></input>
      <p>{userName}</p>
      <Link to="play">play</Link>
    </React.Fragment>
  );
}
