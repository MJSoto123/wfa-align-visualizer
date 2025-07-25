export function mytransform(steps) {
  const history = [];

  for (const step of steps) {
    const snapshot = step.wavefrontSnapshot?.[step.score];
    if (!snapshot) continue;

    const wavefront = Object.entries(snapshot).map(([dStr, offset]) => {
      const d = parseInt(dStr);
      const i = offset;
      const j = i - d;
      return { i, j, score: step.score };
    });

    history.push({
      step: step.score,
      wavefront
    });
  }

  return history;
}
