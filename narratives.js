function generateFullNarrative() {

    let narrative = "";

    const p = sessionState.results.Personality;
    const h = sessionState.results.Happiness;
    const s = sessionState.results.Stress;
    const ei = sessionState.results.Emotional_Intelligence;
    const m = sessionState.results.Motivation;

    // ===============================
    // 1️⃣ Stress + EI Interaction
    // ===============================
    if (s && ei) {

        if (s.total >= 10 && ei.total <= 25) {
            narrative += "Elevated stress combined with developing emotional regulation skills may increase internal strain during demanding periods. Strengthening reflective coping strategies could meaningfully improve balance. ";
        }

        else if (s.total >= 10 && ei.total > 38) {
            narrative += "Although stress levels appear elevated, your emotional regulation capacity may buffer against prolonged disruption. Structured recovery practices may further stabilize performance. ";
        }
    }

    // ===============================
    // 2️⃣ Stress + Conscientiousness
    // ===============================
    if (s && p) {

        if (s.total >= 10 && p.Conscientiousness >= 8) {
            narrative += "High task commitment alongside elevated stress may reflect overextension. Introducing pacing strategies and boundary-setting could prevent long-term fatigue. ";
        }
    }

    // ===============================
    // 3️⃣ Happiness + Motivation
    // ===============================
    if (h && m) {

        if (h.total <= 12 && m.amotivation > m.intrinsic && m.amotivation > m.extrinsic) {
            narrative += "Lower positive affect combined with reduced motivational activation may indicate temporary disengagement. Reconnecting with supportive environments and meaningful goals may restore momentum. ";
        }
    }

    // ===============================
    // 4️⃣ EI + Motivation
    // ===============================
    if (ei && m) {

        if (ei.total > 38 && m.intrinsic > m.extrinsic) {
            narrative += "Strong emotional awareness paired with intrinsic motivation suggests adaptive self-directed engagement patterns. This combination often supports sustained academic growth. ";
        }
    }

    // ===============================
    // 5️⃣ Openness + Intrinsic Motivation
    // ===============================
    if (p && m) {

        if (p.Openness >= 8 && m.intrinsic > m.extrinsic) {
            narrative += "Curiosity and internally driven motivation may enhance exploratory learning and intellectual flexibility. ";
        }
    }

    // ===============================
    // 6️⃣ Default Balanced Statement
    // ===============================
    if (narrative === "") {
        narrative = "Your responses suggest generally adaptive psychological functioning across assessed domains, with balanced emotional and motivational patterns.";
    }

    return narrative;
}
function generateAcademicFunctioning() {

    const p = sessionState.results.Personality;
    const h = sessionState.results.Happiness;
    const s = sessionState.results.Stress;
    const ei = sessionState.results.Emotional_Intelligence;
    const m = sessionState.results.Motivation;

    let overview = "";
    let focusCapacity = "";
    let effortSustainability = "";
    let resilienceProfile = "";
    let recommendation = "";

    // -----------------------------
    // Focus Capacity
    // -----------------------------
    if (s && s.total >= 10) {
        focusCapacity = "Elevated stress may intermittently affect concentration and mental clarity during demanding periods.";
    } else {
        focusCapacity = "Concentration capacity appears generally stable under routine academic demands.";
    }

    // -----------------------------
    // Effort Sustainability
    // -----------------------------
    if (m) {
        if (m.amotivation > m.intrinsic && m.amotivation > m.extrinsic) {
            effortSustainability = "Sustaining academic effort may feel inconsistent at present, particularly when tasks feel disconnected from personal meaning.";
        }
        else if (m.intrinsic > m.extrinsic) {
            effortSustainability = "Internally driven engagement may support deeper and more sustainable learning patterns.";
        }
        else {
            effortSustainability = "Clear structure and accountability systems may enhance effort consistency.";
        }
    }

    // -----------------------------
    // Resilience Profile
    // -----------------------------
    if (ei && s) {
        if (ei.total >= 38 && s.total >= 10) {
            resilienceProfile = "Despite elevated demands, emotional regulation capacity may buffer against prolonged academic disruption.";
        }
        else if (ei.total <= 25 && s.total >= 10) {
            resilienceProfile = "Academic strain may feel more internally taxing when stress and emotional regulation load combine.";
        }
        else {
            resilienceProfile = "Stress-response and emotional regulation patterns appear within adaptive range.";
        }
    }

    // -----------------------------
    // Overextension Risk
    // -----------------------------
    if (p && s) {
        if (p.Conscientiousness >= 8 && s.total >= 10) {
            recommendation = "High achievement orientation combined with elevated stress suggests monitoring pacing and workload balance.";
        }
    }

    if (!recommendation) {
        recommendation = "Maintaining structured routines, recovery breaks, and goal clarity may support sustained academic functioning.";
    }

    // -----------------------------
    // Final Overview
    // -----------------------------
    overview = "Your academic functioning profile reflects the interaction between motivation, emotional regulation, stress load, and task orientation.";

    return `
        <div class="summary-card">
            <div class="summary-title">Academic Functioning Overview</div>
            <div class="summary-text">
                <p>${overview}</p>
                <p><strong>Focus Capacity:</strong> ${focusCapacity}</p>
                <p><strong>Effort Sustainability:</strong> ${effortSustainability}</p>
                <p><strong>Resilience Pattern:</strong> ${resilienceProfile}</p>
                <p><strong>Performance Recommendation:</strong> ${recommendation}</p>
            </div>
        </div>
    `;
}

function generateStrengthWeaknessReport() {

    let strengths = [];
    let growth = [];

    const p = sessionState.results.Personality;
    const ei = sessionState.results.Emotional_Intelligence;
    const h = sessionState.results.Happiness;
    const s = sessionState.results.Stress;
    const m = sessionState.results.Motivation;

    // ==============================
    // Personality Strength Patterns
    // ==============================

    if (p) {

        if (p.Conscientiousness >= 8) {
            strengths.push("Strong task discipline and structured goal orientation. This may support consistent academic performance and planning efficiency.");
        }

        if (p.Agreeableness >= 8) {
            strengths.push("Cooperative interpersonal style that may enhance teamwork and peer collaboration.");
        }

        if (p.Openness >= 8) {
            strengths.push("Intellectual curiosity and openness to new ideas, supporting adaptive learning.");
        }

        if (p.Neuroticism >= 8) {
            growth.push("Heightened emotional sensitivity under stress. Developing structured coping routines may enhance resilience during demanding periods.");
        }

        if (p.Conscientiousness <= 4) {
            growth.push("Lower task structure orientation. Building consistent planning systems may strengthen follow-through.");
        }
    }

    // ==============================
    // EI Strength / Growth
    // ==============================

    if (ei) {

        if (ei.total >= 40) {
            strengths.push("Strong emotional awareness and regulation capacity, which may buffer against academic and interpersonal stress.");
        }

        if (ei.total <= 25) {
            growth.push("Emotional regulation skills may benefit from intentional reflection practices and feedback-based learning.");
        }
    }

    // ==============================
    // Stress Pattern
    // ==============================

    if (s) {

        if (s.total <= 4) {
            strengths.push("Low perceived stress levels suggest effective coping balance under routine demands.");
        }

        if (s.total >= 12) {
            growth.push("Elevated stress activation may impact clarity and energy if sustained. Recovery planning may help stabilize functioning.");
        }
    }

    // ==============================
    // Happiness Pattern
    // ==============================

    if (h) {

        if (h.total >= 22) {
            strengths.push("Positive emotional baseline that may enhance creativity, persistence, and social engagement.");
        }

        if (h.total <= 12) {
            growth.push("Reduced subjective wellbeing at present. Increasing meaningful engagement and restorative activities may support uplift.");
        }
    }

    // ==============================
    // Motivation Pattern
    // ==============================

    if (m) {

        if (m.intrinsic > m.extrinsic && m.intrinsic > m.amotivation) {
            strengths.push("Internally driven motivation, supporting sustained and self-directed learning.");
        }

        if (m.extrinsic > m.intrinsic && m.extrinsic > m.amotivation) {
            strengths.push("Responsiveness to structure and accountability, which may enhance performance in organized environments.");
        }

        if (m.amotivation > m.intrinsic && m.amotivation > m.extrinsic) {
            growth.push("Reduced motivational activation. Clarifying personal goals and reconnecting with purpose may restore engagement.");
        }
    }

    // ==============================
    // Cross-Scale Interaction Logic
    // ==============================

    // High Stress + High Conscientiousness
    if (s && p) {
        if (s.total >= 10 && p.Conscientiousness >= 8) {
            growth.push("Strong achievement drive combined with elevated stress may indicate overextension. Introducing pacing strategies could prevent fatigue.");
        }
    }

    // High EI + High Stress
    if (s && ei) {
        if (s.total >= 10 && ei.total >= 38) {
            strengths.push("Despite elevated stress, emotional regulation capacity may provide resilience and adaptive recovery potential.");
        }
    }

    // Low Happiness + High Amotivation
    if (h && m) {
        if (h.total <= 12 && m.amotivation > m.intrinsic) {
            growth.push("Lower positive affect combined with reduced motivational activation may reflect temporary disengagement. Structured support may restore direction.");
        }
    }

    // Balanced Protective Pattern
    if (ei && h && s) {
        if (ei.total >= 38 && h.total >= 20 && s.total <= 9) {
            strengths.push("Balanced emotional regulation, positive affect, and manageable stress suggest strong adaptive functioning.");
        }
    }

    // ==============================
    // Fallback Safety
    // ==============================

    if (strengths.length === 0) {
        strengths.push("Your profile reflects balanced psychological functioning without pronounced vulnerabilities.");
    }

    if (growth.length === 0) {
        growth.push("No significant development flags identified. Continued self-reflection may support ongoing growth.");
    }

    return { strengths, growth };
}

function generatePersonalityNarrative(traits) {

    let narrative = "";

    const E = traits.Extraversion;
    const A = traits.Agreeableness;
    const C = traits.Conscientiousness;
    const N = traits.Neuroticism;
    const O = traits.Openness;

    // Extraversion
    if (E >= 8) {
        narrative += "You demonstrate strong social energy and are likely comfortable engaging with others in dynamic settings. ";
    } else if (E <= 4) {
        narrative += "You may prefer quieter environments and derive energy from reflection rather than high social stimulation. ";
    } else {
        narrative += "You appear balanced in social engagement, adapting comfortably to both group and individual settings. ";
    }

    // Agreeableness
    if (A >= 8) {
        narrative += "Your responses suggest a cooperative and empathetic interpersonal style. ";
    } else if (A <= 4) {
        narrative += "You may prioritize objectivity and independence over interpersonal harmony in decision-making. ";
    } else {
        narrative += "You likely balance assertiveness with consideration for others. ";
    }

    // Conscientiousness
    if (C >= 8) {
        narrative += "You appear highly organized and goal-directed, with strong self-regulatory capacity. ";
    } else if (C <= 4) {
        narrative += "Structure and routine may not be your primary orientation, and flexibility may characterize your approach. ";
    } else {
        narrative += "You likely show moderate planning and reliability in academic or work tasks. ";
    }

    // Neuroticism
    if (N >= 8) {
        narrative += "You may experience heightened emotional sensitivity under stress, which can influence mood variability. ";
    } else if (N <= 4) {
        narrative += "Your responses suggest emotional stability and calmness under pressure. ";
    } else {
        narrative += "You likely experience typical emotional fluctuations within normal adaptive range. ";
    }

    // Openness
    if (O >= 8) {
        narrative += "You demonstrate curiosity and openness toward new ideas and experiences. ";
    } else if (O <= 4) {
        narrative += "You may prefer familiarity and practical approaches over abstract exploration. ";
    } else {
        narrative += "You likely balance creativity with practicality. ";
    }

    narrative += "These patterns describe tendencies rather than fixed traits and may shift across contexts.";

    return narrative;
}
function generateEINarrative(totalEI) {

    let interpretation = "";
    let academicImpact = "";
    let socialImpact = "";
    let regulationImpact = "";
    let growthFocus = "";

    if (totalEI <= 25) {

        interpretation = "Your responses suggest that emotional awareness and regulation may currently require more conscious effort.";

        academicImpact = "During academic pressure, emotional shifts may influence concentration, decision-making, or persistence.";

        socialImpact = "Interpersonal misunderstandings may occur occasionally, especially in emotionally charged situations.";

        regulationImpact = "Emotional responses may feel intense or harder to modulate in high-demand moments.";

        growthFocus = "Emotional skills are highly developable. Practicing emotion labeling, reflective pauses, and feedback-based learning can strengthen regulation capacity over time.";

    } else if (totalEI <= 38) {

        interpretation = "You demonstrate functional emotional awareness across most everyday situations.";

        academicImpact = "You likely manage routine stress adaptively, though highly complex or ambiguous situations may still feel demanding.";

        socialImpact = "You appear generally responsive to others’ emotions, supporting stable peer interactions.";

        regulationImpact = "Your emotional regulation system appears steady, with room for refinement in high-pressure environments.";

        growthFocus = "Further strengthening perspective-taking and structured emotional reflection may enhance resilience and leadership capacity.";

    } else {

        interpretation = "Your responses suggest strong emotional awareness and regulation skills.";

        academicImpact = "You are likely able to sustain focus and adapt under pressure without significant emotional disruption.";

        socialImpact = "You may naturally navigate interpersonal situations with sensitivity and composure.";

        regulationImpact = "Your emotional processing appears flexible and well-modulated.";

        growthFocus = "Continuing reflective practices and mentorship roles may help you further integrate these strengths into leadership contexts.";
    }

    return `
        <p>${interpretation}</p>
        <p><strong>Academic Context:</strong> ${academicImpact}</p>
        <p><strong>Interpersonal Context:</strong> ${socialImpact}</p>
        <p><strong>Regulation Pattern:</strong> ${regulationImpact}</p>
        <p><strong>Growth Focus:</strong> ${growthFocus}</p>
    `;
}
function generateHappinessNarrative(totalHappiness) {

    let interpretation = "";
    let academicImpact = "";
    let socialImpact = "";
    let resiliencePattern = "";
    let growthFocus = "";

    if (totalHappiness <= 12) {

        interpretation = "Your responses suggest reduced subjective wellbeing at this time.";

        academicImpact = "Lower positive affect can influence energy levels, motivation, and cognitive flexibility during academic tasks.";

        socialImpact = "You may feel less socially engaged or emotionally uplifted in daily interactions.";

        resiliencePattern = "Positive emotional buffering may currently be limited.";

        growthFocus = "Small, consistent positive activities and supportive peer interaction can gradually enhance daily wellbeing.";

    } else if (totalHappiness <= 20) {

        interpretation = "Your responses indicate moderate life satisfaction.";

        academicImpact = "Emotional balance appears stable, though fluctuations may occur during high-demand periods.";

        socialImpact = "You likely maintain generally stable social engagement.";

        resiliencePattern = "Positive emotion appears present but may vary with situational stress.";

        growthFocus = "Intentional positive reinforcement and meaningful engagement can strengthen overall satisfaction.";

    } else {

        interpretation = "Your responses reflect strong subjective wellbeing.";

        academicImpact = "Positive emotional states often support creativity, persistence, and adaptive thinking.";

        socialImpact = "You may naturally contribute positive emotional tone within peer environments.";

        resiliencePattern = "Higher positive affect often buffers against stress-related disruption.";

        growthFocus = "Sustaining balanced routines will help maintain this level of wellbeing.";
    }

    return `
        <p>${interpretation}</p>
        <p><strong>Academic Context:</strong> ${academicImpact}</p>
        <p><strong>Interpersonal Context:</strong> ${socialImpact}</p>
        <p><strong>Resilience Pattern:</strong> ${resiliencePattern}</p>
        <p><strong>Growth Focus:</strong> ${growthFocus}</p>
    `;
}

function generateStressNarrative(totalStress) {

    let interpretation = "";
    let academicImpact = "";
    let socialImpact = "";
    let regulationImpact = "";
    let growthFocus = "";

    if (totalStress <= 4) {

        interpretation = "You currently report low perceived stress levels. Daily demands appear manageable within your coping capacity.";

        academicImpact = "This level of stress typically supports steady concentration and consistent academic performance.";

        socialImpact = "Lower stress often allows greater patience and flexibility in interpersonal interactions.";

        regulationImpact = "Your current stress regulation system appears balanced and adaptive.";

        growthFocus = "Maintaining recovery habits (sleep, structured breaks, reflective pauses) will help sustain this stability.";

    } else if (totalStress <= 9) {

        interpretation = "Your responses suggest moderate perceived stress, which is common during academic cycles.";

        academicImpact = "Short-term stress may enhance motivation, though prolonged pressure could begin to affect focus and memory efficiency.";

        socialImpact = "You may notice reduced emotional bandwidth during busy periods.";

        regulationImpact = "Stress levels appear within adaptive range, though recovery routines become increasingly important.";

        growthFocus = "Building small recovery anchors (structured planning, scheduled breaks, brief emotional check-ins) may improve balance.";

    } else {

        interpretation = "Your responses indicate elevated perceived stress at this time.";

        academicImpact = "Sustained stress may influence concentration, task initiation, and mental clarity if not addressed.";

        socialImpact = "Higher stress levels can reduce emotional availability and increase irritability under pressure.";

        regulationImpact = "Your stress-response system may currently be working at high activation.";

        growthFocus = "Introducing structured recovery practices and seeking supportive conversations may help restore equilibrium.";
    }

    return `
        <p>${interpretation}</p>
        <p><strong>Academic Context:</strong> ${academicImpact}</p>
        <p><strong>Interpersonal Context:</strong> ${socialImpact}</p>
        <p><strong>Regulation Pattern:</strong> ${regulationImpact}</p>
        <p><strong>Growth Focus:</strong> ${growthFocus}</p>
    `;
}
function generateMotivationNarrative(data) {

    const { intrinsic, extrinsic, amotivation } = data;

    let interpretation = "";
    let academicImpact = "";
    let engagementPattern = "";
    let regulationPattern = "";
    let growthFocus = "";

    // 🔹 Amotivation Dominant
    if (amotivation > intrinsic && amotivation > extrinsic) {

        interpretation = "Your responses suggest reduced motivational activation at this time.";

        academicImpact = "You may find it harder to initiate tasks or sustain effort, particularly when work feels disconnected from personal meaning.";

        engagementPattern = "Motivation may feel externally pressured or unclear rather than internally driven.";

        regulationPattern = "Energy levels may fluctuate, especially during periods of academic overload.";

        growthFocus = "Clarifying personal goals, reconnecting with purpose, and breaking tasks into smaller actionable steps may gradually restore engagement.";

    }

    // 🔹 Intrinsic Dominant
    else if (intrinsic > extrinsic && intrinsic > amotivation) {

        interpretation = "Your motivation appears primarily driven by internal interest and personal value.";

        academicImpact = "You are likely to engage more deeply in tasks that feel meaningful or intellectually stimulating.";

        engagementPattern = "Curiosity and self-direction appear to guide your effort patterns.";

        regulationPattern = "Internal motivation often supports persistence even during moderate stress.";

        growthFocus = "Maintaining alignment between coursework and personal interests may sustain long-term academic satisfaction.";

    }

    // 🔹 Extrinsic Dominant
    else if (extrinsic > intrinsic && extrinsic > amotivation) {

        interpretation = "External structure and outcomes appear to significantly influence your engagement.";

        academicImpact = "Clear deadlines, evaluation criteria, and accountability systems may enhance your productivity.";

        engagementPattern = "Performance expectations and recognition may play a meaningful role in sustaining effort.";

        regulationPattern = "Motivation may fluctuate if structure or feedback is inconsistent.";

        growthFocus = "Integrating personal meaning alongside external goals may strengthen long-term resilience.";

    }

    // 🔹 Balanced Profile
    else {

        interpretation = "Your motivation profile reflects a balanced integration of internal interest and external structure.";

        academicImpact = "You likely adapt your effort patterns depending on context and expectations.";

        engagementPattern = "Both personal value and performance standards contribute to your drive.";

        regulationPattern = "Balanced motivation can support sustainable engagement across academic cycles.";

        growthFocus = "Periodic reflection on goals may help maintain clarity and direction.";
    }

    return `
        <p>${interpretation}</p>
        <p><strong>Academic Context:</strong> ${academicImpact}</p>
        <p><strong>Engagement Pattern:</strong> ${engagementPattern}</p>
        <p><strong>Regulation Pattern:</strong> ${regulationPattern}</p>
        <p><strong>Growth Focus:</strong> ${growthFocus}</p>
    `;
}
export {
  generateFullNarrative,
  generateStrengthWeaknessReport,
  generateAcademicFunctioning,
  generatePersonalityNarrative,
  generateEINarrative,
  generateHappinessNarrative,
  generateStressNarrative,
  generateMotivationNarrative
};
