// src/services/recommendation/buildKeywords.js
import { centroidKeywords } from "./centroidKeywords.js";

export function buildKeywordPipes({ personalityType, z = {} }) {
  const base = centroidKeywords[personalityType] || centroidKeywords["Balanced Realist"];
  let primary = base.primary;
  let secondary = base.secondary;

  // Gentle nudges (totally optional)
  if (z.z_O > 0.6) { // high Openness
    secondary += "|experimental|avant garde|installation|new media";
  }
  if (z.z_C > 0.6) { // high Conscientiousness
    primary += "|workshop|masterclass|certification";
  }
  if (z.z_E > 0.6) { // high Extraversion
    primary += "|block party|street fair|dance party|live dj";
  }
  if (z.z_N > 0.6) { // high Neuroticism (i.e., lower emotional stability)
    secondary += "|low sensory|quiet hours|small group|cozy meetup";
  }
  if (z.z_A > 0.6) { // high Agreeableness
    secondary += "|community service|mutual aid|neighborhood meetup";
  }

  // Deduplicate pipes a bit
  primary = dedupePipe(primary);
  secondary = dedupePipe(secondary);
  return { primary, secondary };
}

function dedupePipe(pipe) {
  const set = new Set(pipe.split("|").map(s => s.trim()).filter(Boolean));
  return Array.from(set).join("|");
}
