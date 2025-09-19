// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatScreen from "./ChatScreen";
import DropBox from "./DropBox";
import Home from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<ChatScreen />} />
        <Route path="/file-uploader" element={<DropBox />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
