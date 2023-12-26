import React, { useState, useEffect, useRef } from "react";
import { w3cwebsocket as W3CWebSocket, client, server } from "websocket";
import LoginPage from "./LoginPage.jsx";

const Dashboard = () => {
  // server-side data using refs
  const socketRef = useRef(null);
  const [isConnected, setConnected] = useState(false);
  let clientID = useRef(null);

  useEffect(() => {
    let connectionAttempts = 1;
    const maxConnectionAttempts = 5;

    const tryConnect = () => {
      if (!socketRef.current || socketRef.current.readyState === 3) {
        const newClient = new W3CWebSocket("ws://localhost:8000");
        socketRef.current = newClient;

        newClient.onopen = () => {
          console.log("WebSocket Client Connected");
        };

        newClient.onmessage = (message) => {
            const dataFromServer = JSON.parse(message.data);
    
            if (dataFromServer.type === "connected") {
                clientID.current = dataFromServer.clientID;
                setConnected(true);
            } else if (dataFromServer.type === "testing") {
                console.log("testing message received");
            }
          };

        newClient.onclose = () => {
          console.log("WebSocket Client Disconnected");
          clientID = null;
          setConnected(false);
          if (connectionAttempts < maxConnectionAttempts) {
            connectionAttempts += 1;
            console.log("trying again");
            setTimeout(tryConnect, 2000);
          }
        };
      }
    };

    tryConnect();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {isConnected === false ? (
        <p>Connecting</p>
      ) : (
        <div>
          <p>Connected!!!!</p>
          {isConnected ? <LoginPage connectionClient={socketRef} userID={clientID}/> : null}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
