import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatScreen from "./ChatScreen";
import DropBox from "./DropBox";
import Home from "./pages/Home";
import Login from "./Login";
import Register from "./Register";
import PersonaBuilder from "./pages/PersonaBuilder";
import TaskTracker from "./pages/TaskTracker";
import { Toaster } from "react-hot-toast";  

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/:slug/home" element={<Home />} />
        <Route path="/:slug/bot" element={<ChatScreen />} />
        <Route path="/:slug/train" element={<DropBox />} />
        <Route path="/:slug/persona" element={<PersonaBuilder />} />
        <Route path="/:slug/tasks" element={<TaskTracker />} />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;
