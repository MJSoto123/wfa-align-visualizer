import { useState } from "react";
import SequenceInput from "./components/SequenceInput";
import AlignmentMatrixD3 from "./components/AlignmentMatrixD3";
import { runWFAGapAffineExact } from "./utils/wfa";
import Layout from "./layout/Layout";

export default function App() {
  const [wavefrontHistory, setWavefrontHistory] = useState([]);
  const [seqA, setSeqA] = useState("");
  const [seqB, setSeqB] = useState("");

  const handleRun = (a, b) => {
    setSeqA(a);
    setSeqB(b);
    const { steps } = runWFAGapAffineExact(a, b);
    setWavefrontHistory(steps);
  };

  return (
    <Layout>
      <SequenceInput onRun={handleRun} />
      {wavefrontHistory.length > 0 && seqA && seqB && (
        <AlignmentMatrixD3 steps={wavefrontHistory} seqA={seqA} seqB={seqB} />
      )}
    </Layout>
  );
}
