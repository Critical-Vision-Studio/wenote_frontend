import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from "./App.js";
import "./styles.css";

// Create a single root for the entire application
const root = createRoot(document.getElementById("root"));

// Render the App component inside BrowserRouter
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
    </Routes>
  </BrowserRouter>
);