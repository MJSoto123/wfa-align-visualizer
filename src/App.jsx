import { useState } from "react";
import SequenceInput from "./components/SequenceInput";
import AlignmentMatrixD3 from "./components/AlignmentMatrixD3";
import { runWFAGapAffineExact } from "./utils/wfa";
import { mytransform } from "./components/Transform";

export default function App() {
  const [wavefrontHistory, setWavefrontHistory] = useState([]);
  const [seqA, setSeqA] = useState("");
  const [seqB, setSeqB] = useState("");

  const handleRun = (a, b) => {
    setSeqA(a);
    setSeqB(b);

    const { steps } = runWFAGapAffineExact(seqA, seqB);
    setWavefrontHistory(steps)
  };

  return (
    <div className="p-6 font-mono">
      <h1 className="text-2xl font-bold mb-4">🔬 Wavefront Alignment (D3)</h1>
      <SequenceInput onRun={handleRun} />

      {wavefrontHistory.length > 0 && (
        <AlignmentMatrixD3
          steps={wavefrontHistory}
          seqA={seqA}
          seqB={seqB}
        />
      )}
    </div>
  );
}
