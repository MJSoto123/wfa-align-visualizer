import { useEffect, useRef } from "react";
import * as d3 from "d3";

const cellSize = 25;

export default function AlignmentMatrixD3({ steps, seqA, seqB }) {
  const svgRef = useRef();

  useEffect(() => {
    const matrixMargin = 80;
    const width = 3 * (seqB.length + 2) * cellSize + 2 * matrixMargin;
    const height = (seqA.length + 2) * cellSize + 100;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove();

    const matrixNames = ["M", "I", "D"];
    const xOffset = {
      M: 0,
      I: (seqB.length + 2) * cellSize + matrixMargin,
      D: 2 * (seqB.length + 2) * cellSize + 2 * matrixMargin,
    };

    const yOffset = 40;

    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 5)
      .attr("refY", 5)
      .attr("markerWidth", 5)
      .attr("markerHeight", 5)
      .attr("orient", "auto-start-reverse")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
      .attr("fill", "black");

    matrixNames.forEach((name) => {
      const group = svg.append("g").attr("class", `matrix-${name}`);

      group
        .append("text")
        .attr("x", xOffset[name] + ((seqB.length + 1) * cellSize) / 2)
        .attr("y", yOffset - 10)
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold")
        .text(`Matrix ${name}`);

      // Letras de seqB
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

      // Letras de seqA
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
    const arrowsGroup = svg.append("g").attr("class", "trace-arrows");

    let lastActive = { M: new Set(), I: new Set(), D: new Set() };

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
        .attr("stroke-width", 1)
        // .attr("marker-end", "url(#arrow)");
    }

    function drawWavefrontStep(step) {
      const { M, I, D } = step.wavefrontSnapshot;

      const resetMatrix = (name) => {
        for (const key of lastActive[name]) {
          const [i, j] = key.split("-").map(Number);
          d3.select(`#cell-${name}-${i}-${j}`).attr("fill", "#eeeeee");
        }
        lastActive[name].clear();
      };

      resetMatrix("M");
      resetMatrix("I");
      resetMatrix("D");

      const updateMatrix = (matrix, name) => {
        for (const [kStr, offset] of Object.entries(matrix)) {
          const k = parseInt(kStr);
          const i = offset;
          const j = i - k;
          const key = `${i}-${j}`;

          if (i >= 0 && j >= 0 && i <= seqA.length && j <= seqB.length) {
            d3.select(`#cell-${name}-${i}-${j}`).attr("fill", "#A5D6A7");
            d3.select(`#text-${name}-${i}-${j}`).text(offset);
            lastActive[name].add(key);
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

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep >= steps.length) {
        clearInterval(interval);
        return;
      }
      drawWavefrontStep(steps[currentStep]);
      currentStep++;
    }, 500);

    return () => clearInterval(interval);
  }, [steps, seqA, seqB]);

  return (
    <div className="w-full mt-8 overflow-auto rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 text-center text-sm text-gray-600 font-medium">
        Visualización de matrices de alineamiento (M, I, D)
      </div>
      <div className="flex justify-center overflow-auto">
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
}

