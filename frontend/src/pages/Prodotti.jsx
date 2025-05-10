const prodotti = [
  { id: 1, nome: "Aspirapolvere", prezzo: "€100", descrizione: "Un potente aspirapolvere." },
  { id: 2, nome: "Frigorifero", prezzo: "€300", descrizione: "Frigorifero a doppia porta." },
  { id: 3, nome: "Lavatrice", prezzo: "€250", descrizione: "Lavatrice silenziosa e potente." },
];

const Prodotti = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Prodotti</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {prodotti.map((prodotto) => (
          <div key={prodotto.id} className="bg-gray-200 p-4 rounded shadow">
            <h2 className="text-lg font-bold">{prodotto.nome}</h2>
            <p>{prodotto.descrizione}</p>
            <p className="text-blue-500 font-semibold">{prodotto.prezzo}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Prodotti;
