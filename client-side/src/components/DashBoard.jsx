import React, { useState, useEffect, useRef } from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import LoginPage from "./LoginPage.jsx";

const Dashboard = () => {
  const socketRef = useRef(null);
  const [isConnected, setConnected] = useState(false);
  const clientID = useRef(null);

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
          clientID.current = null;
          setConnected(false);
          if (connectionAttempts < maxConnectionAttempts) {
            connectionAttempts += 1;
            console.log("trying again");
            setTimeout(tryConnect, 2000);
          }
        };

        // Handle window/tab close event to close WebSocket connection
        window.addEventListener("beforeunload", () => {
          if (socketRef.current) {
            socketRef.current.close();
          }
        });
      }
    };

    tryConnect();

    // Cleanup: remove event listener when component unmounts
    return () => {
      window.removeEventListener("beforeunload", () => {
        if (socketRef.current) {
          socketRef.current.close();
        }
      });
    };
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {isConnected ? <p>Connected!!!!</p> : <p>Connecting</p>}
      {isConnected ? <LoginPage connectionClient={socketRef} userID={clientID} /> : null}
    </div>
  );
};

export default Dashboard;
