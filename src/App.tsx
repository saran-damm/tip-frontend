import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatScreen from "./ChatScreen";
import DropBox from "./DropBox"; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* existing chat route */}
        <Route path="/chat" element={<ChatScreen />} />

        {/* new dropbox route */}
        <Route path="/dropbox" element={<DropBox />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
