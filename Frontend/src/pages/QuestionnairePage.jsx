import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ChevronLeft, User, Brain, Star, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { http } from "../lib/http";

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

const TRAIT_DESCRIPTIONS = {
  Extraversion: "How you interact with others and gain energy",
  "Emotional Stability": "How you handle stress and manage emotions", 
  Agreeableness: "How you relate to and cooperate with others",
  Conscientiousness: "How organized and disciplined you are",
  Openness: "How open you are to new experiences and ideas"
};

const TRAIT_ICONS = {
  Extraversion: User,
  "Emotional Stability": Heart,
  Agreeableness: Star,
  Conscientiousness: CheckCircle,
  Openness: Brain
};

export default function QuestionnairePage() {
  const [responses, setResponses] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentSection, setCurrentSection] = useState(0);
  const nav = useNavigate();

  const traitNames = Object.keys(QUESTIONS);
  const totalQuestions = Object.values(QUESTIONS).reduce((sum, questions) => sum + questions.length, 0);
  const answeredCount = Object.keys(responses).filter(key => key !== 'openEnded').length;
  const progress = (answeredCount / totalQuestions) * 100;

  const handleSelect = (trait, idx, val) =>
    setResponses((r) => ({ ...r, [`${trait}-${idx}`]: Number(val) }));

  const handleOpenEnded = (val) =>
    setResponses((r) => ({ ...r, openEnded: val }));

  const nextSection = () => {
    if (currentSection < traitNames.length) {
      setCurrentSection(currentSection + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  async function submit(e) {
    e.preventDefault();
    setError("");

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

    const allAnswered = Object.values(answers).every(
      (arr) => Array.isArray(arr) && arr.every((v) => typeof v === "number")
    );
    if (!allAnswered) {
      return setError("Please answer all questions before submitting.");
    }

    try {
      setSubmitting(true);
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

  const isCurrentSectionComplete = () => {
    if (currentSection >= traitNames.length) return true;
    const trait = traitNames[currentSection];
    return QUESTIONS[trait].every((_, i) => responses[`${trait}-${i}`]);
  };

  const isAllComplete = () => {
    return Object.values(QUESTIONS).every((questions, traitIndex) =>
      questions.every((_, i) => responses[`${traitNames[traitIndex]}-${i}`])
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-white/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost" 
              size="sm"
              onClick={() => nav(-1)}
              className="text-gray-600 hover:text-gray-800"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Personality Questionnaire</h1>
                <p className="text-sm text-gray-600">Help us understand you better</p>
              </div>
            </div>
          </div>
          
          {/* Progress */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-500">{answeredCount}/{totalQuestions} questions</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentSection < traitNames.length ? (
          /* Current Trait Section */
          <Card className="bg-white/70 backdrop-blur-xl border-white/50 shadow-xl">
            <CardHeader>
              <div className="flex items-center space-x-4">
                {(() => {
                  const Icon = TRAIT_ICONS[traitNames[currentSection]];
                  return <Icon className="w-8 h-8 text-indigo-600" />;
                })()}
                <div>
                  <CardTitle className="text-2xl text-gray-800">
                    {traitNames[currentSection]}
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-1">
                    {TRAIT_DESCRIPTIONS[traitNames[currentSection]]}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {QUESTIONS[traitNames[currentSection]].map((question, i) => (
                <div key={i} className="space-y-4">
                  <h3 className="font-medium text-gray-800 leading-relaxed">
                    {question}
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <span className="text-xs text-gray-500 font-medium mb-2 sm:mb-0 sm:mr-4 flex-shrink-0 self-center">
                      Strongly Disagree
                    </span>
                    <div className="flex gap-2 flex-1 justify-center">
                      {[1, 2, 3, 4, 5].map((value) => {
                        const isSelected = responses[`${traitNames[currentSection]}-${i}`] === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => handleSelect(traitNames[currentSection], i, value)}
                            className={`w-12 h-12 rounded-full border-2 font-semibold transition-all duration-200 hover:scale-110 ${
                              isSelected
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-600 text-white shadow-lg'
                                : 'bg-white/50 border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-white/80'
                            }`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs text-gray-500 font-medium mt-2 sm:mt-0 sm:ml-4 flex-shrink-0 self-center">
                      Strongly Agree
                    </span>
                  </div>
                </div>
              ))}

              {/* Navigation */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={prevSection}
                  disabled={currentSection === 0}
                  className="bg-white/50"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                <span className="text-sm text-gray-600">
                  {currentSection + 1} of {traitNames.length + 1}
                </span>
                
                <Button
                  onClick={nextSection}
                  disabled={!isCurrentSectionComplete()}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  Next Section
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Final Section - Open-ended question */
          <Card className="bg-white/70 backdrop-blur-xl border-white/50 shadow-xl">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Heart className="w-8 h-8 text-indigo-600" />
                <div>
                  <CardTitle className="text-2xl text-gray-800">
                    Tell Us About Yourself
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-1">
                    Help us understand your preferences better
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <label className="block text-lg font-medium text-gray-800">
                  Tell us about your ideal roommate or living preferences:
                </label>
                <textarea
                  value={responses.openEnded || ""}
                  onChange={(e) => handleOpenEnded(e.target.value)}
                  placeholder="Describe your ideal living situation, roommate qualities you value, or any specific preferences..."
                  className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white/50 backdrop-blur-sm resize-none transition-all duration-200"
                />
                <p className="text-sm text-gray-500">
                  This helps us better match you with compatible people and events.
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Final Navigation */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={prevSection}
                  className="bg-white/50"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                <Button
                  onClick={submit}
                  disabled={submitting || !isAllComplete()}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg px-8 py-6 shadow-xl hover:shadow-2xl transform transition-all duration-200 hover:scale-105"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Complete Questionnaire
                      <CheckCircle className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section Overview */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {traitNames.map((trait, index) => {
            const Icon = TRAIT_ICONS[trait];
            const isComplete = QUESTIONS[trait].every((_, i) => responses[`${trait}-${i}`]);
            const isCurrent = index === currentSection;
            
            return (
              <Card key={trait} className={`bg-white/50 backdrop-blur-sm border transition-all duration-200 cursor-pointer hover:shadow-lg ${
                isCurrent ? 'border-indigo-300 shadow-lg ring-2 ring-indigo-100' : 
                isComplete ? 'border-green-300 bg-green-50/50' : 'border-white/50'
              }`} onClick={() => setCurrentSection(index)}>
                <CardContent className="p-4 flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isComplete ? 'bg-green-500 text-white' :
                    isCurrent ? 'bg-indigo-500 text-white' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {isComplete ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{trait}</p>
                    <p className="text-xs text-gray-500">
                      {QUESTIONS[trait].filter((_, i) => responses[`${trait}-${i}`]).length}/{QUESTIONS[trait].length} answered
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}