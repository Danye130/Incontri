import { Link } from "react-router-dom";
import { FaHome, FaBoxOpen, FaConciergeBell, FaPhoneAlt } from "react-icons/fa";

const Header = () => {
  return (
    <header className="bg-blue-600 text-white p-4 shadow-lg">
      <nav className="flex justify-center gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 p-2 bg-blue-500 hover:bg-blue-700 rounded-lg transition"
        >
          <FaHome size={18} />
          <span>Home</span>
        </Link>
        <Link
          to="/prodotti"
          className="flex items-center gap-2 p-2 bg-blue-500 hover:bg-blue-700 rounded-lg transition"
        >
          <FaBoxOpen size={18} />
          <span>Prodotti</span>
        </Link>
        <Link
          to="/servizi"
          className="flex items-center gap-2 p-2 bg-blue-500 hover:bg-blue-700 rounded-lg transition"
        >
          <FaConciergeBell size={18} />
          <span>Servizi</span>
        </Link>
        <Link
          to="/contatti"
          className="flex items-center gap-2 p-2 bg-blue-500 hover:bg-blue-700 rounded-lg transition"
        >
          <FaPhoneAlt size={18} />
          <span>Contatti</span>
        </Link>
      </nav>
    </header>
  );
};

export default Header;
