import React, { useState } from "react";
import axios from "axios";

export default function ChatWindow({ onClose }) {
  const [step, setStep] = useState("contact"); // Switch between 'contact' and 'chat'
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send email via Brevo API
      await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: { name: formData.name, email: formData.email },
          to: [{ email: "office@csoc.bg", name: "Office" }],
          subject: `Chat Inquiry from ${formData.name}`,
          htmlContent: `
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Phone:</strong> ${formData.phone}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Initial Message:</strong> ${message || "No message provided"}</p>
          `,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "api-key": "YOUR_BREVO_API_KEY", // Replace with your Brevo API key
          },
        }
      );

      setSuccess(true);
      setError("");
      setStep("chat");
    } catch (err) {
      console.error(err);
      setError("Failed to send your details. Please try again.");
      setSuccess(false);
    }
  };

  // Handle chat message submission
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      setChatHistory([...chatHistory, { user: "You", text: message }]);
      setMessage("");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "100px",
        right: "20px",
        width: "300px",
        backgroundColor: "white",
        borderRadius: "10px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#007bff",
          color: "white",
          padding: "10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h4 style={{ margin: 0 }}>Chat</h4>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: "white" }}
        >
          ✖
        </button>
      </div>

      {/* Contact Form */}
      {step === "contact" && (
        <form
          onSubmit={handleSubmit}
          style={{ padding: "10px", display: "flex", flexDirection: "column" }}
        >
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{ marginBottom: "10px", padding: "5px" }}
            />
          </label>
          <label>
            Phone:
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              style={{ marginBottom: "10px", padding: "5px" }}
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ marginBottom: "10px", padding: "5px" }}
            />
          </label>
          <button
            type="submit"
            style={{
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              padding: "8px",
              borderRadius: "5px",
            }}
          >
            Submit
          </button>
        </form>
      )}

      {/* Chat Messages */}
      {step === "chat" && (
        <>
          <div
            style={{
              flex: 1,
              padding: "10px",
              overflowY: "auto",
              backgroundColor: "#f9f9f9",
            }}
          >
            {chatHistory.map((chat, index) => (
              <div key={index} style={{ marginBottom: "10px" }}>
                <strong>{chat.user}:</strong> {chat.text}
              </div>
            ))}
          </div>
          <form
            onSubmit={handleChatSubmit}
            style={{ display: "flex", padding: "10px", borderTop: "1px solid #ccc" }}
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              style={{ flex: 1, padding: "5px", marginRight: "10px" }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: "5px",
              }}
            >
              Send
            </button>
          </form>
        </>
      )}

      {/* Success or Error Message */}
      {success && <p style={{ color: "green", padding: "10px" }}>Details sent successfully!</p>}
      {error && <p style={{ color: "red", padding: "10px" }}>{error}</p>}
    </div>
  );
}
