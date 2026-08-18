import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CheckMessage from './pages/CheckMessage';
import CheckLink from './pages/CheckLink';
import CheckUPI from './pages/CheckUPI';
import CheckVoice from './pages/CheckVoice';
import ReportScam from './pages/ReportScam';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-surface">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/check-message" element={<CheckMessage />} />
            <Route path="/check-link" element={<CheckLink />} />
            <Route path="/check-upi" element={<CheckUPI />} />
            <Route path="/check-voice" element={<CheckVoice />} />
            <Route path="/report" element={<ReportScam />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
