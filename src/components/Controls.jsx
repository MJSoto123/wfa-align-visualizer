import { useEffect, useRef, useState } from "react";

export default function Controls({ stepIndex, setStepIndex, maxStep }) {
  const [autoPlay, setAutoPlay] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (autoPlay) {
      intervalRef.current = setInterval(() => {
        setStepIndex((prev) => {
          if (prev < maxStep) {
            return prev + 1;
          } else {
            setAutoPlay(false);
            return prev;
          }
        });
      }, 500); // velocidad: 500 ms por paso
    }

    return () => clearInterval(intervalRef.current);
  }, [autoPlay, setStepIndex, maxStep]);

  const toggleAutoPlay = () => setAutoPlay((prev) => !prev);

  return (
    <div className="flex flex-wrap gap-2 my-4 items-center">
      <button
        className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
        onClick={() => setStepIndex(0)}
        disabled={stepIndex === 0}
      >
        ⏮️ Inicio
      </button>

      <button
        className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
        onClick={() => setStepIndex((prev) => Math.max(prev - 1, 0))}
        disabled={stepIndex === 0}
      >
        ⏪ Anterior
      </button>

      <button
        className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
        onClick={() => setStepIndex((prev) => Math.min(prev + 1, maxStep))}
        disabled={stepIndex === maxStep}
      >
        ⏩ Siguiente
      </button>

      <button
        className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
        onClick={() => setStepIndex(maxStep)}
        disabled={stepIndex === maxStep}
      >
        ⏭️ Final
      </button>

      <button
        className={`px-3 py-1 rounded ${
          autoPlay ? "bg-red-400 hover:bg-red-500" : "bg-green-400 hover:bg-green-500"
        } text-white`}
        onClick={toggleAutoPlay}
      >
        {autoPlay ? "⏹️ Detener" : "▶️ Autoplay"}
      </button>
    </div>
  );
}
