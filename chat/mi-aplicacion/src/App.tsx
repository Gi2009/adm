import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Chat from './pages/Chat';
import Home from './pages/home';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat onCreated={function (): void {
          throw new Error('Function not implemented.');
        } } />} />
      </Routes>
    </Router>
  );
}

export default App;