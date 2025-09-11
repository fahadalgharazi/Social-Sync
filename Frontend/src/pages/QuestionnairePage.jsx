import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../lib/http"; // axios instance with baseURL + withCredentials

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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();

  const handleSelect = (trait, idx, val) =>
    setResponses((r) => ({ ...r, [`${trait}-${idx}`]: Number(val) }));

  const handleOpenEnded = (val) =>
    setResponses((r) => ({ ...r, openEnded: val }));

  async function submit(e) {
    e.preventDefault();
    setError("");

    // Build a shape the backend can compute from:
    // { answers: { Extraversion:[...], EmotionalStability:[...], ... }, openEnded: "..." }
    const answers = {};
    for (const trait of Object.keys(QUESTIONS)) {
      answers[trait] = QUESTIONS[trait].map((_, i) => {
        const key = `${trait}-${i}`;
        const v = responses[key];
        return typeof v === "number" ? v : null;
      });
    }
    const payload = {
      answers,
      openEnded: responses.openEnded || "",
    };

    // Optional: quick client-side completeness check (UX only)
    const allAnswered = Object.values(answers).every(
      (arr) => Array.isArray(arr) && arr.every((v) => typeof v === "number")
    );
    if (!allAnswered) {
      return setError("Please answer all questions before submitting.");
    }

    try {
      setSubmitting(true);
      // POST to your backend (BFF). Implement this in your server:
      // POST /api/questionnaire/submit
      // Body: { answers: {...}, openEnded: string }
      // Server responsibility: compute scores, z-scores, cluster, upsert to user_personality_data
      await http.post("/questionnaire/submit", payload);
      nav("/events");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to submit questionnaire";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Questionnaire</h1>

      <form onSubmit={submit}>
        {Object.keys(QUESTIONS).map((trait) => (
          <section key={trait} style={{ marginBottom: 16 }}>
            <h3>{trait}</h3>
            {QUESTIONS[trait].map((q, i) => (
              <div key={i} style={{ margin: "8px 0" }}>
                <label style={{ display: "block", marginBottom: 6 }}>{q}</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[1, 2, 3, 4, 5].map((v) => {
                    const active =
                      responses[`${trait}-${i}`] &&
                      Number(responses[`${trait}-${i}`]) === v;
                    return (
                      <button
                        type="button"
                        key={v}
                        onClick={() => handleSelect(trait, i, v)}
                        style={{
                          padding: "6px 10px",
                          border: "1px solid #ccc",
                          background: active ? "#eee" : "white",
                          cursor: "pointer",
                        }}
                        aria-pressed={active}
                      >
                        {v}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        ))}

        <div style={{ marginTop: 16 }}>
          <label style={{ display: "block", marginBottom: 6 }}>
            Tell us about your ideal roommate or living preferences:
          </label>
          <textarea
            onChange={(e) => handleOpenEnded(e.target.value)}
            value={responses.openEnded || ""}
            rows={4}
            style={{ width: "100%", maxWidth: 640 }}
          />
        </div>

        {error && (
          <p role="alert" style={{ color: "crimson", marginTop: 12 }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} style={{ marginTop: 16 }}>
          {submitting ? "Submitting…" : "Submit"}
        </button>
      </form>
    </main>
  );
}
