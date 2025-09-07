import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const QUESTIONS = {
  Extraversion: [
    "I enjoy meeting new people and building connections.",
    "I feel energized after spending time with groups of people.",
    "I am comfortable initiating conversations with others.",
  ],
  "Emotional Stability": [
    "I remain calm and composed under stressful situations.",
    "I rarely feel overwhelmed by unexpected challenges.",
    "I am good at managing my emotions when things don't go as planned.",
  ],
  Agreeableness: [
    "I find it easy to get along with people who have different opinions.",
    "I enjoy helping others and making them feel comfortable.",
    "I try to avoid arguments and disagreements.",
  ],
  Conscientiousness: [
    "I am very organized in my daily activities and tasks.",
    "I always meet deadlines for tasks or assignments.",
    "I pay close attention to detail in my work.",
  ],
  Openness: [
    "I enjoy trying new activities or exploring unfamiliar topics.",
    "I like to think about abstract or complex ideas.",
    "I am open to learning and experiencing new cultures or lifestyles.",
  ],
};

export default function QuestionnairePage() {
  const [responses, setResponses] = useState({});
  const nav = useNavigate();

  const handleSelect = (trait, idx, val) =>
    setResponses(r => ({ ...r, [`${trait}-${idx}`]: Number(val) }));

  async function submit(e) {
    e.preventDefault();
    // 1) averages
    const results = {};
    for (const trait of Object.keys(QUESTIONS)) {
      const vals = Object.keys(responses)
        .filter(k => k.startsWith(trait))
        .map(k => responses[k]);
      results[trait] = vals.reduce((s,v)=>s+v,0) / QUESTIONS[trait].length;
    }
    results.openEnded = responses.openEnded || "";

    // 2) z-scores + cluster (same math as your current file)
    const norms = {
      Extraversion: { mean: 3.30, stdDev: 0.70 },
      Neuroticism: { mean: 2.90, stdDev: 0.75 },
      Agreeableness: { mean: 3.60, stdDev: 0.60 },
      Conscientiousness: { mean: 3.40, stdDev: 0.65 },
      Openness: { mean: 3.70, stdDev: 0.65 },
    };
    const neuroticism = 5 - results["Emotional Stability"];
    const z = {
      z_E: (results.Extraversion - norms.Extraversion.mean)/norms.Extraversion.stdDev,
      z_N: (neuroticism - norms.Neuroticism.mean)/norms.Neuroticism.stdDev,
      z_A: (results.Agreeableness - norms.Agreeableness.mean)/norms.Agreeableness.stdDev,
      z_C: (results.Conscientiousness - norms.Conscientiousness.mean)/norms.Conscientiousness.stdDev,
      z_O: (results.Openness - norms.Openness.mean)/norms.Openness.stdDev,
    };
    const centroids = {
      "Reactive Idealist": [0.035, 0.077, -0.063, -0.231, 0.047],
      "Balanced Realist": [0.047, -0.121, -0.212, 0.113, 0.088],
      "Sensitive Companion": [-0.058, -0.062, 0.091, 0.082, -0.124],
      "Secure Optimist": [0.107, -0.217, 0.081, 0.060, -0.098]
    };
    const userVec = [z.z_E, z.z_N, z.z_A, z.z_C, z.z_O];
    let best = null, min = Infinity;
    for (const [label, c] of Object.entries(centroids)) {
      const d = Math.sqrt(c.reduce((s,cv,i)=>s + (userVec[i]-cv)**2, 0));
      if (d < min) { min = d; best = label; }
    }
    const personalityType = best;

    // 3) write to Supabase (same table/fields as before)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("user_personality_data").upsert([{
      id: user.id,
      extraversion: results.Extraversion,
      emotional_stability: results["Emotional Stability"],
      agreeableness: results.Agreeableness,
      conscientiousness: results.Conscientiousness,
      openness: results.Openness,
      open_ended: results.openEnded,
      personality_type: personalityType,
      z_score_extraversion: z.z_E,
      z_score_neuroticism: z.z_N,
      z_score_agreeableness: z.z_A,
      z_score_conscientiousness: z.z_C,
      z_score_openness: z.z_O,
      cluster_distance: min,
    }]);

    nav("/events");
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Questionnaire</h1>
      <form onSubmit={submit}>
        {Object.keys(QUESTIONS).map(trait => (
          <section key={trait}>
            <h3>{trait}</h3>
            {QUESTIONS[trait].map((q, i) => (
              <div key={i} style={{ margin: "8px 0" }}>
                <label>{q}</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[1,2,3,4,5].map(v => (
                    <button
                      type="button"
                      key={v}
                      onClick={()=>handleSelect(trait, i, v)}
                      style={{ padding: "6px 10px", border: "1px solid #ccc" }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}
        <div>
          <label>Tell us about your ideal roommate or living preferences:</label>
          <textarea onChange={e=>setResponses(r=>({...r, openEnded: e.target.value}))}/>
        </div>
        <button type="submit">Submit</button>
      </form>
    </main>
  );
}
