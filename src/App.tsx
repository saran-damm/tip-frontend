import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChatScreen from './ChatScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/chat" element={<ChatScreen />} />
        {/* Add other routes here as needed */}
      </Routes>
    </BrowserRouter>
  );
}

export default App
