import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Home from './pages/Home';
import CreateRoom from './pages/CreateRoom';
import Room from './pages/Room';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/create" element={<CreateRoom />} />
        <Route path="/room/:inviteCode" element={<Room />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
