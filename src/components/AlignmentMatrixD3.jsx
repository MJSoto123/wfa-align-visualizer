import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const cellSize = 25;

export default function AlignmentMatrixD3({ steps, seqA, seqB }) {
  const svgRef = useRef();
  const [currentStep, setCurrentStep] = useState(0);
  const lastActiveRef = useRef({ M: new Set(), I: new Set(), D: new Set() });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [steps]);

  useEffect(() => {
    const matrixMargin = 80;
    const width = 3 * (seqB.length + 2) * cellSize + 2 * matrixMargin;
    const height = (seqA.length + 2) * cellSize + 100;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    if (currentStep === 0) svg.selectAll("*").remove();

    const matrixNames = ["M", "I", "D"];
    const xOffset = {
      M: 0,
      I: (seqB.length + 2) * cellSize + matrixMargin,
      D: 2 * (seqB.length + 2) * cellSize + 2 * matrixMargin,
    };

    const yOffset = 40;

    if (currentStep === 0) {
      matrixNames.forEach((name) => {
        const group = svg.append("g").attr("class", `matrix-${name}`);

        group
          .append("text")
          .attr("x", xOffset[name] + ((seqB.length + 1) * cellSize) / 2)
          .attr("y", yOffset - 10)
          .attr("text-anchor", "middle")
          .attr("font-weight", "bold")
          .text(`Matrix ${name}`);

        for (let j = 0; j <= seqB.length; j++) {
          const label = j === 0 ? "" : seqB[j - 1];
          group
            .append("text")
            .attr("x", xOffset[name] + (j + 1) * cellSize + cellSize / 2)
            .attr("y", yOffset + cellSize - 6)
            .attr("text-anchor", "middle")
            .attr("font-size", 12)
            .attr("fill", "#000")
            .text(label);
        }

        for (let i = 0; i <= seqA.length; i++) {
          const label = i === 0 ? "" : seqA[i - 1];
          group
            .append("text")
            .attr("x", xOffset[name] + cellSize * 0.9)
            .attr("y", yOffset + (i + 2) * cellSize - cellSize / 2 + 4)
            .attr("text-anchor", "end")
            .attr("font-size", 12)
            .attr("fill", "#000")
            .text(label);
        }

        for (let i = 0; i <= seqA.length; i++) {
          for (let j = 0; j <= seqB.length; j++) {
            const x = xOffset[name] + (j + 1) * cellSize;
            const y = yOffset + (i + 1) * cellSize;

            group
              .append("rect")
              .attr("x", x)
              .attr("y", y)
              .attr("width", cellSize)
              .attr("height", cellSize)
              .attr("fill", "white")
              .attr("stroke", "gray")
              .attr("id", `cell-${name}-${i}-${j}`);

            group
              .append("text")
              .attr("x", x + cellSize / 2)
              .attr("y", y + cellSize / 2 + 4)
              .attr("text-anchor", "middle")
              .attr("font-size", 10)
              .attr("fill", "#000")
              .attr("id", `text-${name}-${i}-${j}`)
              .text("");
          }
        }
      });
      svg.append("g").attr("class", "trace-arrows");
    }

    const arrowsGroup = svg.select(".trace-arrows");

    function drawArrow(matrixName, fromI, fromJ, toI, toJ) {
      if (fromI === toI && fromJ === toJ) return;
      const xBase = xOffset[matrixName];

      arrowsGroup
        .append("line")
        .attr("x1", xBase + (fromJ + 1) * cellSize + cellSize / 2)
        .attr("y1", yOffset + (fromI + 1) * cellSize + cellSize / 2)
        .attr("x2", xBase + (toJ + 1) * cellSize + cellSize / 2)
        .attr("y2", yOffset + (toI + 1) * cellSize + cellSize / 2)
        .attr("stroke", "black")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1);
    }

    const resetMatrix = (name) => {
      for (const key of lastActiveRef.current[name]) {
        const [i, j] = key.split("-").map(Number);
        d3.select(`#cell-${name}-${i}-${j}`).attr("fill", "#eeeeee");
      }
      lastActiveRef.current[name].clear();
    };

    matrixNames.forEach(resetMatrix);

    function drawWavefrontStep(step) {
      const { M, I, D } = step.wavefrontSnapshot;

      const updateMatrix = (matrix, name) => {
        for (const [kStr, offset] of Object.entries(matrix)) {
          const k = parseInt(kStr);
          const i = offset;
          const j = i - k;
          const key = `${i}-${j}`;

          if (i >= 0 && j >= 0 && i <= seqA.length && j <= seqB.length) {
            d3.select(`#cell-${name}-${i}-${j}`).attr("fill", "#A5D6A7");
            d3.select(`#text-${name}-${i}-${j}`).text(offset);
            lastActiveRef.current[name].add(key);
          }
        }
      };

      updateMatrix(M, "M");
      updateMatrix(I, "I");
      updateMatrix(D, "D");

      if (step.from) {
        const { score: fromS, k: fromK, type: fromType } = step.from;
        const matrixName = step.type;
        const toI = step.i;
        const toJ = step.j;

        const fromStep = steps.find(
          (s) =>
            s.score === fromS && s.diagonal === fromK && s.type === fromType
        );

        if (fromStep) {
          const fromI = fromStep.i;
          const fromJ = fromStep.j;

          const isInBounds = (i, j) =>
            i >= 0 && j >= 0 && i <= seqA.length && j <= seqB.length;

          if (isInBounds(fromI, fromJ) && isInBounds(toI, toJ)) {
            drawArrow(matrixName, fromI, fromJ, toI, toJ);
          }
        }
      }
    }

    drawWavefrontStep(steps[currentStep]);
  }, [steps, seqA, seqB, currentStep]);

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  return (
    <div className="w-full mt-8 overflow-auto rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 text-center text-sm text-gray-600 font-medium">
        Visualización de matrices de alineamiento (M, I, D)
      </div>
      <div className="flex justify-center overflow-auto">
        <svg ref={svgRef}></svg>
      </div>
      {steps.length > 0 && (
        <div className="flex flex-col items-center justify-center mt-6 space-y-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePrev}
              className="px-4 py-1 bg-gray-200 text-sm rounded hover:bg-gray-300 flex items-center gap-2"
            >
              <img src="/src/assets/atras.png" alt="prev" className="h-4 w-4" />
              Paso anterior
            </button>

            <label className="text-sm font-medium text-gray-600">
              Paso {currentStep + 1} / {steps.length}
            </label>

            <button
              onClick={handleNext}
              className="px-4 py-1 bg-gray-200 text-sm rounded hover:bg-gray-300 flex items-center gap-2"
            >
              Paso siguiente
              <img src="/src/assets/adelante.png" alt="next" className="h-4 w-4" />
            </button>
          </div>
          <input
            type="range"
            min="0"
            max={steps.length - 1}
            value={currentStep}
            onChange={(e) => setCurrentStep(parseInt(e.target.value))}
            className="w-2/3"
          />
        </div>
      )}
    </div>
  );
}
