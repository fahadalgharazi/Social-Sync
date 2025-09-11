// Backend/src/services/questionnaire.service.js
import { supabaseAdmin, supabaseAnon } from '../config/supabase.js';

const NORMS = {
  Extraversion: { mean: 3.30, stdDev: 0.70 },
  Neuroticism: { mean: 2.90, stdDev: 0.75 },
  Agreeableness: { mean: 3.60, stdDev: 0.60 },
  Conscientiousness: { mean: 3.40, stdDev: 0.65 },
  Openness: { mean: 3.70, stdDev: 0.65 },
};
const CENTROIDS = {
  "Reactive Idealist": [0.035, 0.077, -0.063, -0.231, 0.047],
  "Balanced Realist": [0.047, -0.121, -0.212, 0.113, 0.088],
  "Sensitive Companion": [-0.058, -0.062, 0.091, 0.082, -0.124],
  "Secure Optimist": [0.107, -0.217, 0.081, 0.060, -0.098],
};

export async function submit(req, res, next) {
  try {
    const userId = req.user.id;
    const { answers, openEnded = "" } = req.body || {};
    if (!answers) return next({ status: 400, message: "Missing answers" });

    const avg = (arr) => arr.reduce((s, v) => s + Number(v || 0), 0) / arr.length;
    const Extraversion = avg(answers.Extraversion || []);
    const EmotionalStability = avg(answers["Emotional Stability"] || []);
    const Agreeableness = avg(answers.Agreeableness || []);
    const Conscientiousness = avg(answers.Conscientiousness || []);
    const Openness = avg(answers.Openness || []);

    const neuroticism = 5 - EmotionalStability;
    const z_E = (Extraversion - NORMS.Extraversion.mean) / NORMS.Extraversion.stdDev;
    const z_N = (neuroticism - NORMS.Neuroticism.mean) / NORMS.Neuroticism.stdDev;
    const z_A = (Agreeableness - NORMS.Agreeableness.mean) / NORMS.Agreeableness.stdDev;
    const z_C = (Conscientiousness - NORMS.Conscientiousness.mean) / NORMS.Conscientiousness.stdDev;
    const z_O = (Openness - NORMS.Openness.mean) / NORMS.Openness.stdDev;

    const userVec = [z_E, z_N, z_A, z_C, z_O];
    let personalityType = null, min = Infinity;
    for (const [label, c] of Object.entries(CENTROIDS)) {
      const d = Math.sqrt(c.reduce((s, cv, i) => s + (userVec[i] - cv) ** 2, 0));
      if (d < min) { min = d; personalityType = label; }
    }

    const now = new Date().toISOString();
    const { error } = await supabaseAdmin.from('user_personality_data').upsert([{
      id: userId,
      extraversion: Extraversion,
      emotional_stability: EmotionalStability,
      agreeableness: Agreeableness,
      conscientiousness: Conscientiousness,
      openness: Openness,
      open_ended: openEnded,
      personality_type: personalityType,
      z_score_extraversion: z_E,
      z_score_neuroticism: z_N,
      z_score_agreeableness: z_A,
      z_score_conscientiousness: z_C,
      z_score_openness: z_O,
      cluster_distance: min,
      updated_at: now,
    }], { onConflict: 'id' });

    if (error) return next({ status: 400, message: error.message });

    res.json({
      success: true,
      data: { personalityType, z: { z_E, z_N, z_A, z_C, z_O }, distance: min }
    });
  } catch (e) {
    next({ status: 400, message: e.message || "Failed to submit questionnaire" });
  }
}
