import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter , Routes, Route } from 'react-router-dom';
import ServerModeDisplay from "./ServerModeDisplay.js";
import App from "./App.js";
import "./styles.css";

const AppRouting = () =>(
  <BrowserRouter>
  <Routes>
      <Route path="/" element={<App />} />
  </Routes>
  </BrowserRouter>
);


const root = createRoot(document.getElementById("root"));
//const server_mode = createRoot(document.getElementById("server_mode"));


root.render(<AppRouting />);
//server_mode.render(<ServerModeDisplay/>);