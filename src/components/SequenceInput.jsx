import { useState } from "react";

export default function SequenceInput({ onRun }) {
  const [seqA, setSeqA] = useState("");
  const [seqB, setSeqB] = useState("");
  const [error, setError] = useState("");

  const isValid = (s) => /^[ATCGU]*$/i.test(s.trim());

  const handleRun = () => {
    const cleanA = seqA.trim().toUpperCase();
    const cleanB = seqB.trim().toUpperCase();

    if (!cleanA || !cleanB) {
      setError("Ambas secuencias son obligatorias.");
    } else if (!isValid(cleanA) || !isValid(cleanB)) {
      setError("Solo se permiten letras A, T, C, G, U.");
    } else {
      setError("");
      onRun(cleanA, cleanB);
    }
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Secuencia A
        </label>
        <input
          type="text"
          value={seqA}
          onChange={(e) => setSeqA(e.target.value)}
          placeholder=""
          className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Secuencia B
        </label>
        <input
          type="text"
          value={seqB}
          onChange={(e) => setSeqB(e.target.value)}
          placeholder=""
          className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium p-3 rounded-md">
          {error}
        </div>
      )}

      <button
        onClick={handleRun}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-md transition-shadow shadow-sm"
      >
        Ejecutar Alineamiento
      </button>
    </div>
  );
}
