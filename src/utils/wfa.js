export function runWFAGapAffineExact(seqA, seqB, gapOpen = 2, gapExtend = 1) {
  const m = seqA.length;
  const n = seqB.length;
  const maxScore = m + n;

  const M = {};
  const I = {};
  const D = {};
  const backtrace = {};
  const steps = [];

  const initOffset = 0;
  M[0] = { 0: initOffset };
  backtrace[0] = { 0: { M: null } };

  const extendMatch = (i, j) => {
    while (i < m && j < n && seqA[i] === seqB[j]) {
      i++;
      j++;
    }
    return i;
  };

  
  for (let s = 1; s <= maxScore; s++) {
    M[s] = {};
    I[s] = {};
    D[s] = {};
    backtrace[s] = {};

    const ks = new Set();
    const addKs = (dict, offset = 0) => {
      if (!dict) return;
      for (const k in dict) ks.add(parseInt(k) + offset);
    };

    addKs(M[s - 1]);
    addKs(I[s - gapExtend], 1);
    addKs(D[s - gapExtend], -1);
    addKs(M[s - gapOpen - gapExtend], 1);
    addKs(M[s - gapOpen - gapExtend], -1);

    for (const k of ks) {
      // === I ===
      const fromM_I = (M[s - gapOpen - gapExtend]?.[k - 1] ?? -Infinity) + 1;
      const fromI_I = (I[s - gapExtend]?.[k - 1] ?? -Infinity) + 1;
      I[s][k] = Math.max(fromM_I, fromI_I);
      if (I[s][k] !== -Infinity) {
        backtrace[s][k] = backtrace[s][k] || {};
        backtrace[s][k]["I"] = {
          from: {
            score: fromM_I >= fromI_I ? s - gapOpen - gapExtend : s - gapExtend,
            k: k - 1,
            type: fromM_I >= fromI_I ? "M" : "I"
          }
        };

        const i = I[s][k];
        const j = i - k;
        steps.push({
          score: s,
          diagonal: k,
          offset: i,
          i,
          j,
          type: "I",
          from: { ...backtrace[s][k]["I"].from },
          wavefrontSnapshot: {
            M: { ...M[s] },
            I: { ...I[s] },
            D: { ...D[s] },
          },
        });
      }

      // === D ===
      const fromM_D = M[s - gapOpen - gapExtend]?.[k + 1] ?? -Infinity;
      const fromD_D = D[s - gapExtend]?.[k + 1] ?? -Infinity;
      D[s][k] = Math.max(fromM_D, fromD_D);
      if (D[s][k] !== -Infinity) {
        backtrace[s][k] = backtrace[s][k] || {};
        backtrace[s][k]["D"] = {
          from: {
            score: fromM_D >= fromD_D ? s - gapOpen - gapExtend : s - gapExtend,
            k: k + 1,
            type: fromM_D >= fromD_D ? "M" : "D"
          }
        };

        const i = D[s][k];
        const j = i - k;
        steps.push({
          score: s,
          diagonal: k,
          offset: i,
          i,
          j,
          type: "D",
          from: { ...backtrace[s][k]["D"].from },
          wavefrontSnapshot: {
            M: { ...M[s] },
            I: { ...I[s] },
            D: { ...D[s] },
          },
        });
      }

      // === M ===
      const fromM_M = (M[s - 1]?.[k] ?? -Infinity) + 1;
      const bestOffset = Math.max(fromM_M, I[s][k], D[s][k]);
      if (bestOffset === -Infinity) continue;

      let i = bestOffset;
      let j = i - k;
      const extended = extendMatch(i, j);
      M[s][k] = extended;

      backtrace[s][k] = backtrace[s][k] || {};
      backtrace[s][k]["M"] = {
        from: {
          score:
            fromM_M >= I[s][k] && fromM_M >= D[s][k]
              ? s - 1
              : I[s][k] >= D[s][k]
              ? s
              : s,
          k: k,
          type:
            fromM_M >= I[s][k] && fromM_M >= D[s][k]
              ? "M"
              : I[s][k] >= D[s][k]
              ? "I"
              : "D"
        }
      };

      steps.push({
        score: s,
        diagonal: k,
        offset: extended,
        i: extended,
        j: extended - k,
        type: "M",
        from: { ...backtrace[s][k]["M"].from },
        wavefrontSnapshot: {
          M: { ...M[s] },
          I: { ...I[s] },
          D: { ...D[s] },
        },
      });

      if (extended === m && extended - k === n) {
        return {
          finalScore: s,
          finalK: k,
          M,
          backtrace,
          steps,
        };
      }
    }
  }

  return { finalScore: -1, steps };
}


export function tracebackWFA({ backtrace, M, finalScore, finalK, seqA, seqB }) {
  const alignment = [];
  let s = finalScore;
  let k = finalK;
  let type = "M";
  let i = M[s][k];
  let j = i - k;

  while (s > 0) {
    const bt = backtrace[s]?.[k]?.[type];
    if (!bt) break;

    const { score: prevS, k: prevK, type: prevType } = bt;
    const prevI =
      prevType === "I"
        ? (M[prevS]?.[prevK] ?? 0) + 1
        : prevType === "D"
        ? M[prevS]?.[prevK] ?? 0
        : (M[prevS]?.[prevK] ?? 0) + 1;
    const currI = type === "M" ? M[s][k] : type === "I" ? I[s][k] : D[s][k];
    const currJ = currI - k;
    const prevJ = prevI - prevK;

    while (i > prevI && j > prevJ) {
      i--;
      j--;
      alignment.push({
        op: seqA[i] === seqB[j] ? "M" : "X",
        charA: seqA[i],
        charB: seqB[j],
        i,
        j,
      });
    }

    if (type === "I") {
      alignment.push({ op: "I", charA: "-", charB: seqB[prevJ], i, j: prevJ });
    } else if (type === "D") {
      alignment.push({ op: "D", charA: seqA[prevI], charB: "-", i: prevI, j });
    }

    s = prevS;
    k = prevK;
    type = prevType;
    i = prevI;
    j = prevJ;
  }

  return alignment.reverse();
}