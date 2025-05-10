import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Chat from "./components/Chat";
import Home from "./pages/Home";
import Prodotti from "./pages/Prodotti";
import Servizi from "./pages/Servizi";
import Contatti from "./pages/Contatti";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/prodotti" element={<Prodotti />} />
        <Route path="/servizi" element={<Servizi />} />
        <Route path="/contatti" element={<Contatti />} />
      </Routes>
      <Footer />
      <Chat />
    </Router>
  );
}

export default App;
