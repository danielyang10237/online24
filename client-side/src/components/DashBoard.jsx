import React, { useState, useEffect, useRef } from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import LoginPage from "./LoginPage.jsx";
import "../css/loadingPage.css";

const Dashboard = () => {
  const socketRef = useRef(null);
  const [clientID, setClientID] = useState(null);
  const [isConnected, setConnected] = useState(false);
  const [text, setText] = useState("Connecting");

  useEffect(() => {
    let connectionAttempts = 1;
    const maxConnectionAttempts = 5;

    const tryConnect = () => {
      if (!socketRef.current || socketRef.current.readyState === 3) {
        const newClient = new W3CWebSocket("wss://online24-server.onrender.com:8000/");
        socketRef.current = newClient;

        newClient.onopen = () => {
          console.log("WebSocket Client Connected");
        };

        newClient.onmessage = (message) => {
          const dataFromServer = JSON.parse(message.data);

          if (dataFromServer.type === "connected") {
            setClientID(dataFromServer.id);
            setConnected(true);
          } else if (dataFromServer.type === "testing") {
            console.log("testing message received");
          }
        };

        newClient.onclose = () => {
          console.log("WebSocket Client Disconnected");
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

  useEffect(() => {
    window.addEventListener("beforeunload", handleClose); // Handle page refresh

    return () => {
      window.removeEventListener("beforeunload", handleClose);
    };
  }, [socketRef.current]); // Run when the socket changes

  const handleClose = () => {
    if (socketRef.current) {
      socketRef.current.close();
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setText((prevText) => {
        switch (prevText) {
          case "Connecting":
            return "Connecting.";
          case "Connecting.":
            return "Connecting..";
          case "Connecting..":
            return "Connecting...";
          default:
            return "Connecting";
        }
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {isConnected ? (
        <LoginPage connectionClient={socketRef} clientID={clientID} />
      ) : (
        <div className="center">
          <p className="connecting-text">{text}</p>
        </div>
      )}
    </>
  );
};

export default Dashboard;
