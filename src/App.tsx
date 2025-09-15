import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatScreen from "./ChatScreen";
import DropBox from "./DropBox";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/chat" element={<ChatScreen />} />
        <Route path="/dropbox" element={<DropBox />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
