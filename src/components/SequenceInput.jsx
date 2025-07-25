import { useState } from "react";

export default function SequenceInput({ onRun }) {
  const [seqA, setSeqA] = useState("GATTACA");
  const [seqB, setSeqB] = useState("GCATGCU");

  const handleRun = () => {
    const cleanA = seqA.trim().toUpperCase();
    const cleanB = seqB.trim().toUpperCase();
    if (cleanA && cleanB) {
      onRun(cleanA, cleanB);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-6 space-y-4">
      <div>
        <label className="block font-semibold mb-1">Secuencia A:</label>
        <input
          type="text"
          value={seqA}
          onChange={(e) => setSeqA(e.target.value)}
          className="w-full border px-3 py-1 rounded"
          placeholder="Ej: GATTACA"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Secuencia B:</label>
        <input
          type="text"
          value={seqB}
          onChange={(e) => setSeqB(e.target.value)}
          className="w-full border px-3 py-1 rounded"
          placeholder="Ej: GCATGCU"
        />
      </div>

      <button
        onClick={handleRun}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
      >
        Ejecutar Alineamiento
      </button>
    </div>
  );
}
