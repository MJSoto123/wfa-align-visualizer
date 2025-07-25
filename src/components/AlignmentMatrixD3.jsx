import { useEffect, useRef } from "react";
import * as d3 from "d3";

const cellSize = 25;

export default function AlignmentMatrixD3({ steps, seqA, seqB }) {
  const svgRef = useRef();

  useEffect(() => {
    const width = 3 * (seqB.length + 1) * cellSize + 60;
    const height = (seqA.length + 1) * cellSize + 40;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove();

    const matrixNames = ["M", "I", "D"];
    const xOffset = {
      M: 0,
      I: (seqB.length + 1) * cellSize + 20,
      D: 2 * (seqB.length + 1) * cellSize + 40,
    };

    // Añadir marcador para flechas
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

    const arrowsGroup = svg.append("g").attr("class", "trace-arrows");

    // Dibujar las 3 matrices
    matrixNames.forEach((name) => {
      const group = svg.append("g").attr("class", `matrix-${name}`);

      group
        .append("text")
        .attr("x", xOffset[name] + (seqB.length * cellSize) / 2)
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold")
        .text(`Matrix ${name}`);

      for (let i = 0; i <= seqA.length; i++) {
        for (let j = 0; j <= seqB.length; j++) {
          group
            .append("rect")
            .attr("x", xOffset[name] + j * cellSize)
            .attr("y", 30 + i * cellSize)
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("fill", "white")
            .attr("stroke", "gray")
            .attr("id", `cell-${name}-${i}-${j}`);

          group
            .append("text")
            .attr("x", xOffset[name] + j * cellSize + cellSize / 2)
            .attr("y", 30 + i * cellSize + cellSize / 2 + 4)
            .attr("text-anchor", "middle")
            .attr("font-size", 10)
            .attr("fill", "#000")
            .attr("id", `text-${name}-${i}-${j}`)
            .text("");
        }
      }
    });

    let lastActive = {
      M: new Set(),
      I: new Set(),
      D: new Set(),
    };

    function drawArrow(matrixName, fromI, fromJ, toI, toJ) {
      const xBase = xOffset[matrixName];

      arrowsGroup
        .append("line")
        .attr("x1", xBase + fromJ * cellSize + cellSize / 2)
        .attr("y1", 30 + fromI * cellSize + cellSize / 2)
        .attr("x2", xBase + toJ * cellSize + cellSize / 2)
        .attr("y2", 30 + toI * cellSize + cellSize / 2)
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("marker-end", "url(#arrow)");
    }

    function drawWavefrontStep(step) {
      const { M, I, D } = step.wavefrontSnapshot;

      // Resetear colores anteriores
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

      console.log("🎯 Paso actual:", step);

      // Dibujar flecha del backtrace
      if (step.from) {
        const { score: fromS, k: fromK, type: fromType } = step.from;
        const matrixName = step.type;
        const toI = step.i;
        const toJ = step.j;

        // Buscar paso anterior real (NO en el snapshot)
        const fromStep = steps.find(
          s => s.score === fromS && s.diagonal === fromK && s.type === fromType
        );

        if (fromStep) {
          const fromI = fromStep.i;
          const fromJ = fromStep.j;

          // Debug
          console.log("↩️ Flecha:", {
            type: matrixName,
            from: [fromI, fromJ],
            to: [toI, toJ],
          });

          drawArrow(matrixName, fromI, fromJ, toI, toJ);
        } else {
          console.warn("❌ No se encontró fromStep para", step.from);
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
    <div className="overflow-auto">
      <svg ref={svgRef}></svg>
    </div>
  );
}
