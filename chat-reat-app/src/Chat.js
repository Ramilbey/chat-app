import React, { useEffect, useState } from "react";
import socket from "./socket";

const Chat = () => {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState("");

  useEffect(() => {
    const name = prompt("What is your name");
    const roomName = prompt("Enter the room name: ");
    setUsername(name);
    setRoom(roomName);

    socket.emit("join room", { user: name, room: roomName });

    socket.on("chat message", (data) => {
      setMessages((prev) => [...prev, data]);
    });
    socket.on("typing", (data) => {
      setTypingUser(data.user);
      setTimeout(() => setTypingUser(""), 3000);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim() !== "") {
      socket.emit("chat message", { user: username, text: message, room });
      setMessage("");
    }
  };
  const handleTyping = () => {
    socket.emit("typing", { user: username, room });
  };

  return (
    <div>
      <h2>Room: {room}</h2>
      <ul>
        {messages.map((msg, i) => (
          <li key={i}>
            <strong>{msg.user}</strong>: {msg.text}
          </li>
        ))}
      </ul>
      {typingUser && (
        <p>
          <i>{typingUser} is typing...</i>
        </p>
      )}
      <form onSubmit={handleSend}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onInput={handleTyping}
        />
        <button>Send</button>
      </form>
    </div>
  );
};
export default Chat;
