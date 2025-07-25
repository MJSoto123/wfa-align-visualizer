import React from "react";

export default function WavefrontMatrix({ steps, currentStep, seqA, seqB }) {
  if (
    !steps ||
    steps.length === 0 ||
    !seqA ||
    !seqB ||
    typeof currentStep !== "number" ||
    currentStep >= steps.length
  ) {
    return null;
  }

  const { i: curI, j: curJ, wavefrontSnapshot } = steps[currentStep];

  const rows = seqA.length + 1;
  const cols = seqB.length + 1;

  const visited = new Set();
  Object.values(wavefrontSnapshot || {}).forEach((level) => {
    for (const [diagStr, offsetStr] of Object.entries(level || {})) {
      const offset = parseInt(offsetStr);
      const diag = parseInt(diagStr);
      const i = offset;
      const j = i - diag;
      if (i >= 0 && j >= 0 && i <= seqA.length && j <= seqB.length) {
        visited.add(`${i},${j}`);
      }
    }
  });

  const getArrow = (i, j) => {
    if (i > 0 && j > 0) return "↖";
    if (i > 0) return "↑";
    if (j > 0) return "←";
    return "";
  };

  return (
    <div className="overflow-auto mt-6">
      <table className="border-collapse text-xs font-mono shadow-md">
        <thead>
          <tr>
            <th className="bg-white"></th>
            <th className="bg-white"></th>
            {seqB.split("").map((ch, j) => (
              <th key={j} className="border bg-aqua-100 text-blue-800 p-1">
                {ch}
              </th>
            ))}
          </tr>
          <tr>
            <th className="bg-white"></th>
            <th className="border bg-aqua-50 text-gray-600 p-1">0</th>
            {Array.from({ length: seqB.length }).map((_, j) => (
              <th key={j} className="border text-gray-600 p-1">
                {-2 * (j + 1)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              <th className="border bg-aqua-100 text-blue-800 p-1">
                {i > 0 ? seqA[i - 1] : ""}
              </th>
              <th className="border text-gray-600 p-1">{-2 * i}</th>
              {Array.from({ length: cols }).map((_, j) => {
                const key = `${i},${j}`;
                const isCurrent = i === curI && j === curJ;
                const isVisited = visited.has(key);

                let bg = "bg-white";
                if (isVisited) bg = "bg-pink-100";
                if (isCurrent) bg = "bg-pink-400 text-white font-bold";

                return (
                  <td
                    key={key}
                    className={`border text-center p-1 w-10 h-10 ${bg}`}
                  >
                    <div className="text-sm">{getArrow(i, j)}</div>
                    <div className="text-xs opacity-70">{/* Optional score */}</div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
