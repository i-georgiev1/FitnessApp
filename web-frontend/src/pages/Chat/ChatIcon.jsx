import React, { useState } from "react";
import ChatWindow from "./ChatWindow"; // Adjust the path based on your folder structure
import { FaComments } from "react-icons/fa";

export default function ChatIcon() {
  const [isOpen, setIsOpen] = useState(false); // Controls chat window visibility

  return (
    <>
      {/* Chat Icon */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "#007bff",
          color: "white",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
        onClick={() => setIsOpen(!isOpen)} // Toggles the chat window
      >
        <FaComments size={24} />
      </div>

      {/* Chat Window */}
      {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}
    </>
  );
}
