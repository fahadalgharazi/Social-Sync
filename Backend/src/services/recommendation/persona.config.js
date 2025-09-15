export default {
  "Secure Optimist": {
    segmentMix: { Music: 0.40, Sports: 0.25, "Arts & Theatre": 0.20, Miscellaneous: 0.15 },
    include: {
      tokens: [
        "music festival","leadership summit","motivational speaker","charity run",
        "team building","networking gala","outdoor adventure","pitch competition",
        "fitness challenge","tedx","workshop","masterclass","certification",
        "block party","street fair","dance party","live dj","career fair","hackathon",
        "impact summit","keynote","volunteer drive","climbing meetup","trail run",
        "crossfit throwdown","entrepreneur summit"
      ],
      classificationHints: {
        Music: ["Festival","Dance/Electronic"],
        Sports: ["Running","Fitness"],
        "Arts & Theatre": ["Lecture","Seminar","Class/Workshop"],
        Miscellaneous: ["Festival","Community","Fair"]
      }
    },
    scoringWeights: { persona: 0.55, proximity: 0.20, recency: 0.15, diversity: 0.10 }
  },

  "Reactive Idealist": {
    segmentMix: { Music: 0.55, "Arts & Theatre": 0.20, Sports: 0.15, Miscellaneous: 0.10 },
    include: {
      tokens: [
        "open mic","art show","indie concert","creative writing","spoken word",
        "poetry slam","paint and sip","comedy night","zine fest","creative meetup",
        "improv","gallery opening","indie film","house show","live acoustic",
        "street art","maker fair","craft fair","jam session","community theater"
      ],
      classificationHints: { "Arts & Theatre": ["Theatre","Comedy"] }
    },
    scoringWeights: { persona: 0.55, proximity: 0.20, recency: 0.15, diversity: 0.10 }
  },

  "Balanced Realist": {
    segmentMix: { Music: 0.40, "Arts & Theatre": 0.30, Sports: 0.20, Miscellaneous: 0.10 },
    include: {
      tokens: [
        "career workshop","professional networking","business panel","public speaking",
        "goal setting","entrepreneur event","book club","project management",
        "productivity workshop","industry mixer","resume clinic","mentor meetup",
        "tech talk","ama","roundtable","cofounder meetup","product demo",
        "startup pitch","accelerator event","town hall"
      ],
      classificationHints: { "Arts & Theatre": ["Lecture","Seminar","Class/Workshop"] }
    },
    scoringWeights: { persona: 0.55, proximity: 0.20, recency: 0.15, diversity: 0.10 }
  },

  "Sensitive Companion": {
    segmentMix: { "Arts & Theatre": 0.40, Music: 0.35, Miscellaneous: 0.15, Sports: 0.10 },
    include: {
      tokens: [
        "yoga class","guided meditation","healing circle","support group",
        "mindfulness retreat","community volunteer","wellness workshop",
        "plant care class","tea ceremony","small group discussion","sound bath",
        "breathwork","grief support","nature walk","journaling circle","art therapy",
        "reiki","forest bathing","gratitude circle","community garden"
      ],
      classificationHints: { "Arts & Theatre": ["Class/Workshop"] }
    },
    scoringWeights: { persona: 0.55, proximity: 0.20, recency: 0.15, diversity: 0.10 }
  }
};
