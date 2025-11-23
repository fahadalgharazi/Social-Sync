import personaConfig from './persona.config.js';

export function buildPersonaSignals(personalityType) {
  const cfg = personaConfig[personalityType] || personaConfig['Balanced Realist'];

  const tokens = (cfg.include?.tokens || []).map((t) => t.toLowerCase().trim());
  const classificationHints = Object.fromEntries(
    Object.entries(cfg.include?.classificationHints || {}).map(([seg, arr]) => [
      seg,
      (arr || []).map((x) => String(x).trim()),
    ]),
  );

  const weights = {
    persona: 0.55,
    proximity: 0.2,
    recency: 0.15,
    diversity: 0.1,
    ...(cfg.scoringWeights || {}),
  };

  return {
    segmentMix: cfg.segmentMix || {
      Music: 0.5,
      'Arts & Theatre': 0.25,
      Sports: 0.15,
      Miscellaneous: 0.1,
    },
    tokens,
    classificationHints,
    weights,
  };
}
