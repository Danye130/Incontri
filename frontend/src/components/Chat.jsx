import { useState } from "react";
import { FaWhatsapp, FaFacebookMessenger, FaComments, FaTimes } from "react-icons/fa";

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <div className="bg-white p-4 rounded-lg shadow-lg w-64">
          <button onClick={toggleChat} className="float-right text-red-500">
            <FaTimes size={20} />
          </button>
          <h2 className="font-bold mb-2 text-blue-600">Chatta con Noi</h2>
          <p className="mb-2">Siamo disponibili su:</p>
          <div className="flex gap-4 justify-center">
            <a
              href="https://wa.me/393347715166"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-500 hover:text-green-700"
            >
              <FaWhatsapp size={32} />
            </a>
            <a
              href="https://www.facebook.com/tuttoperlacasagaressio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700"
            >
              <FaFacebookMessenger size={32} />
            </a>
          </div>
        </div>
      )}

      <button
        onClick={toggleChat}
        className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition flex items-center gap-2"
      >
        <FaComments size={20} />
        {isOpen ? "Chiudi" : "Chatta con Noi"}
      </button>
    </div>
  );
};

export default Chat;
