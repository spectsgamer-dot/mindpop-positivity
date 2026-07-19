(function attachMindPopScoring(global) {
  "use strict";

  const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
  const round = (value, places = 2) => Number(value.toFixed(places));
  const reverse = (value, min, max) => min + max - value;

  function assertResponses(scale, responses) {
    if (!Array.isArray(responses) || responses.length !== scale.questions.length) {
      throw new Error("Unexpected response count for " + scale.id + ".");
    }
    responses.forEach((value) => {
      if (!Number.isFinite(value) || value < scale.min || value > scale.max) {
        throw new Error("Invalid response value for " + scale.id + ".");
      }
    });
  }

  const agreement5 = [
    { value: 1, label: "Strongly disagree" },
    { value: 2, label: "Disagree" },
    { value: 3, label: "Neutral" },
    { value: 4, label: "Agree" },
    { value: 5, label: "Strongly agree" }
  ];

  const agreement7 = [
    { value: 1, label: "Strongly disagree" },
    { value: 2, label: "Disagree" },
    { value: 3, label: "Slightly disagree" },
    { value: 4, label: "Neutral" },
    { value: 5, label: "Slightly agree" },
    { value: 6, label: "Agree" },
    { value: 7, label: "Strongly agree" }
  ];

  function anchored7(low, high) {
    return Array.from({ length: 7 }, (_, index) => ({
      value: index + 1,
      label: index === 0 ? low : index === 6 ? high : String(index + 1)
    }));
  }

  const frequency5 = [
    { value: 0, label: "Never" },
    { value: 1, label: "Almost never" },
    { value: 2, label: "Sometimes" },
    { value: 3, label: "Fairly often" },
    { value: 4, label: "Very often" }
  ];

  const scales = {
    personality: {
      id: "personality",
      short: "Personality",
      title: "Personality patterns",
      icon: "&#10022;",
      time: "2 min",
      description: "How you tend to relate, plan, feel and explore.",
      source: "BFI-10",
      min: 1,
      max: 5,
      options: agreement5,
      questions: [
        "I see myself as someone who is reserved.",
        "I see myself as someone who is generally trusting.",
        "I see myself as someone who tends to be lazy.",
        "I see myself as someone who is relaxed and handles stress well.",
        "I see myself as someone who has few artistic interests.",
        "I see myself as someone who is outgoing and sociable.",
        "I see myself as someone who tends to find fault with others.",
        "I see myself as someone who does a thorough job.",
        "I see myself as someone who gets nervous easily.",
        "I see myself as someone who has an active imagination."
      ],
      score(responses) {
        assertResponses(this, responses);
        const keyed = responses.map((value, index) => [0, 2, 3, 4, 6].includes(index)
          ? reverse(value, 1, 5)
          : value);
        return {
          kind: "profile",
          domains: {
            extraversion: round(mean([keyed[0], keyed[5]])),
            agreeableness: round(mean([keyed[1], keyed[6]])),
            conscientiousness: round(mean([keyed[2], keyed[7]])),
            emotionalReactivity: round(mean([keyed[3], keyed[8]])),
            openness: round(mean([keyed[4], keyed[9]]))
          }
        };
      }
    },

    emotionalSkills: {
      id: "emotionalSkills",
      short: "Emotional skills",
      title: "Emotional skills check-in",
      icon: "&#9678;",
      time: "2 min",
      description: "A practical reflection on noticing and handling emotions.",
      source: "Informal reflection set",
      min: 1,
      max: 5,
      options: agreement5,
      questions: [
        "I understand my emotions clearly.",
        "I can regulate my emotions effectively.",
        "I stay calm under pressure.",
        "I understand how others feel.",
        "I can respond appropriately to other people's emotions.",
        "I notice how my emotions influence my behaviour.",
        "I handle emotional situations well.",
        "I am sensitive to the feelings of others.",
        "I can pause before acting on a strong emotion.",
        "I express my emotions appropriately."
      ],
      score(responses) {
        assertResponses(this, responses);
        return {
          kind: "average",
          average: round(mean(responses)),
          domains: {
            awareness: round(mean([responses[0], responses[5]])),
            selfManagement: round(mean([responses[1], responses[2], responses[6], responses[8], responses[9]])),
            empathy: round(mean([responses[3], responses[4], responses[7]]))
          }
        };
      }
    },

    happiness: {
      id: "happiness",
      short: "Happiness",
      title: "Subjective happiness",
      icon: "&#9728;",
      time: "1 min",
      description: "A quick look at how happy life feels to you overall.",
      source: "Subjective Happiness Scale",
      min: 1,
      max: 7,
      optionsByQuestion: [
        anchored7("Not a very happy person", "A very happy person"),
        anchored7("Less happy", "More happy"),
        anchored7("Not at all", "A great deal"),
        anchored7("Not at all", "A great deal")
      ],
      questions: [
        "In general, I consider myself a happy person.",
        "Compared with most of my peers, I consider myself happy.",
        "Some people are generally very happy and enjoy life regardless of what is going on. To what extent does this describe you?",
        "Some people are generally not very happy. Although they are not depressed, they never seem as happy as they might be. To what extent does this describe you?"
      ],
      score(responses) {
        assertResponses(this, responses);
        const keyed = [...responses];
        keyed[3] = reverse(keyed[3], 1, 7);
        return { kind: "average", average: round(mean(keyed)) };
      }
    },

    stress: {
      id: "stress",
      short: "Stress",
      title: "Perceived stress",
      icon: "&#8776;",
      time: "1 min",
      description: "How manageable life has felt during the last month.",
      source: "PSS-4",
      min: 0,
      max: 4,
      options: frequency5,
      questions: [
        "In the last month, how often have you felt unable to control the important things in your life?",
        "In the last month, how often have you felt confident about your ability to handle personal problems?",
        "In the last month, how often have you felt that things were going your way?",
        "In the last month, how often have you felt difficulties piling up so high that you could not overcome them?"
      ],
      score(responses) {
        assertResponses(this, responses);
        const keyed = [...responses];
        keyed[1] = reverse(keyed[1], 0, 4);
        keyed[2] = reverse(keyed[2], 0, 4);
        return { kind: "total", total: keyed.reduce((sum, value) => sum + value, 0) };
      }
    },

    motivation: {
      id: "motivation",
      short: "Motivation",
      title: "Motivation snapshot",
      icon: "&#8599;",
      time: "2 min",
      description: "What is currently pulling you toward - or away from - your work.",
      source: "Adapted SDT reflection set",
      min: 1,
      max: 7,
      options: agreement7,
      prompt: "I put effort into my studies or work because...",
      questions: [
        "Because I enjoy it.",
        "Because I believe it is personally important.",
        "Because I would feel guilty if I did not.",
        "Because I am rewarded for doing it.",
        "I am not really sure why I do it.",
        "Because I find it interesting.",
        "Because I get pleasure from doing it.",
        "Because I would feel ashamed if I did not.",
        "Because other people expect me to do it.",
        "I do not really know why I am doing it.",
        "Because I value it.",
        "I feel I may be wasting my time doing it."
      ],
      score(responses) {
        assertResponses(this, responses);
        const domains = {
          intrinsic: round(mean([responses[0], responses[5], responses[6]])),
          identified: round(mean([responses[1], responses[10]])),
          introjected: round(mean([responses[2], responses[7]])),
          external: round(mean([responses[3], responses[8]])),
          amotivation: round(mean([responses[4], responses[9], responses[11]]))
        };
        const ranking = Object.entries(domains).sort((a, b) => b[1] - a[1]);
        return { kind: "profile", domains, dominant: ranking[0][0], runnerUp: ranking[1][0] };
      }
    }
  };

  const api = Object.freeze({ scales: Object.freeze(scales), mean, round, reverse });
  global.MindPopScoring = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
