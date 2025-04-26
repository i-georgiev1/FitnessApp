import React from "react";
import "../styles/Preloader.css";

const Preloader = ({ fadeOut }) => {
  return (
    <div className={`preloader-container ${fadeOut ? "fade-out" : ""}`}>
      <div className="spinner"></div>
      <p></p>
    </div>
  );
};

export default Preloader;
