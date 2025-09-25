import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatScreen from "./ChatScreen";
import DropBox from "./DropBox";
import Home from "./pages/Home";
import Login from "./Login";
import Register from "./Register";
import { Toaster } from "react-hot-toast";  

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/chat" element={<ChatScreen />} />
        <Route path="/file-uploader" element={<DropBox />} />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;
