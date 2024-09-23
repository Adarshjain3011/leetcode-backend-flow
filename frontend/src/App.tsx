import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);

  // Function to initialize the WebSocket connection
  const initializeWebSocket = () => {
    const socket = new WebSocket('ws://localhost:5000');

    socket.onopen = () => {
      console.log('WebSocket connected');
      setWs(socket);
    };

    socket.onmessage = (event) => {
      // Handle incoming messages from the server
      const message = event.data;
      console.log('Received message:', message);
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected, trying to reconnect...');
      setTimeout(initializeWebSocket, 3000); // Try reconnecting after 3 seconds
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return socket;
  };

  useEffect(() => {
    const socket = initializeWebSocket();

    // Clean up WebSocket connection when the component unmounts
    return () => {
      socket?.close();
    };
  }, []);

  async function clickHandler() {
    try {
      const response = await axios.post("http://localhost:3000/submit", {
        userId: "12",
        problemId: Math.random().toString(),
        code: "console.log('hello world 26')"
      });
      console.log('Submission response:', response.data);

      if (ws && ws.readyState === WebSocket.OPEN) {
        // Send userId to the WebSocket server to register this client
        ws.send(JSON.stringify({ userId: "12" }));
      } else {
        console.log("WebSocket is not open, message not sent.");
      }
    } catch (error: any) {
      console.error('Error during submission:', error);
    }
  }

  return (
    <div>
      <h1>Hello world</h1>
      <button onClick={clickHandler}>Click me</button>
      <div>
        <h2>Messages:</h2>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
