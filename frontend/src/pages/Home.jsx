import React from "react";
import Header from "../components/Header";

const Home = () => {
  return (
    <div>
      <Header />
      <main className="p-6">
        <h2 className="text-xl font-bold">Benvenuto nella Home Page!</h2>
        <p className="mt-4">Qui potrai trovare i nostri servizi e prodotti.</p>
      </main>
    </div>
  );
};

export default Home;
