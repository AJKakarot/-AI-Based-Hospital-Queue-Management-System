import { NextResponse } from "next/server";
import { buildSymptomCheckerPrompt } from "@/lib/prompts/symptom-checker";

const DEFAULT_RESPONSE = {
  recommendedDoctor: "General Physician",
  urgencyLevel: "Low",
  reason: "A consultation with a healthcare provider is recommended.",
  selfCareTips: [],
  disclaimer: "This is AI-assisted guidance and not a medical diagnosis. Please consult a licensed doctor.",
};

function validateUrgencyLevel(level) {
  return level === "Low" || level === "Medium" || level === "High" ? level : "Low";
}

function sanitizeResponse(data, urgencyLevel) {
  const tips = urgencyLevel === "Low" 
    ? (Array.isArray(data.selfCareTips) ? data.selfCareTips.slice(0, 4) : [])
    : [];

  return {
    recommendedDoctor: data.recommendedDoctor || DEFAULT_RESPONSE.recommendedDoctor,
    urgencyLevel: validateUrgencyLevel(data.urgencyLevel),
    reason: data.reason || DEFAULT_RESPONSE.reason,
    selfCareTips: tips,
    disclaimer: data.disclaimer || DEFAULT_RESPONSE.disclaimer,
  };
}

function extractJSONFromText(text) {
  if (!text || typeof text !== "string") return null;
  let s = text.trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
  }
  const brace = s.indexOf("{");
  if (brace !== -1) {
    let depth = 0;
    let end = -1;
    for (let i = brace; i < s.length; i++) {
      if (s[i] === "{") depth++;
      if (s[i] === "}") {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end !== -1) {
      try {
        return JSON.parse(s.slice(brace, end + 1));
      } catch (_) {}
    }
  }
  try {
    return JSON.parse(s);
  } catch (_) {
    return null;
  }
}

async function callGeminiAPI(prompt) {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  const modelConfigs = [
    { model: "gemini-2.5-flash", version: "v1beta" },
    { model: "gemini-2.0-flash", version: "v1beta" },
    { model: "gemini-1.5-pro", version: "v1beta" },
    { model: "gemini-pro", version: "v1" },
  ];

  for (const config of modelConfigs) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/${config.version}/models/${config.model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.35,
              maxOutputTokens: 600,
            },
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            ],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed = content ? extractJSONFromText(content) : null;
        if (parsed && typeof parsed === "object" && (parsed.recommendedDoctor || parsed.urgencyLevel)) {
          return parsed;
        }
      }
    } catch (error) {
      continue;
    }
  }

  return null;
}

function getFallbackRecommendation(symptoms) {
  const text = symptoms.toLowerCase();
  const shortDesc = symptoms.length > 60 ? symptoms.slice(0, 57) + "…" : symptoms;
  let urgencyLevel = "Low";
  let recommendedDoctor = "General Physician";
  let selfCareTips = [];

  const highUrgencyPattern = /\b(severe|intense|unbearable|emergency|chest pain|difficulty breathing|can't breathe|unconscious|bleeding|heavy bleed|trauma|fracture|broken bone|गंभीर|आपातकालीन)\b/;
  const mediumUrgencyPattern = /\b(moderate|persistent|worsening|fever|high fever|pain|nausea|vomit|dizziness|निरंतर|बुखार|दर्द|उल्टी)\b/;

  if (highUrgencyPattern.test(text)) {
    urgencyLevel = "High";
  } else if (mediumUrgencyPattern.test(text)) {
    urgencyLevel = "Medium";
  }

  const TIPS_BY_CATEGORY = {
    Cardiologist: [
      "Rest and avoid strenuous activity until you see a doctor",
      "Avoid excess caffeine or stimulants before your visit",
      "Stay hydrated and note when symptoms occur to share with your doctor",
    ],
    Dermatologist: [
      "Avoid scratching affected areas to reduce irritation",
      "Use mild, fragrance-free soap and keep the area clean and dry",
      "Wear loose, breathable clothing over affected skin",
    ],
    Orthopedic: [
      "Rest the affected area and avoid heavy lifting or repetitive strain",
      "Use ice or a warm compress for 15–20 minutes if it feels comforting",
      "Avoid staying in one position too long; move gently within comfort",
    ],
    Neurologist: [
      "Rest in a quiet, dim environment if you have headache or dizziness",
      "Stay hydrated and avoid skipping meals",
      "Limit screen time and bright lights when symptoms are present",
    ],
    Gastroenterologist: [
      "Eat small, light, bland meals (e.g. rice, toast, banana)",
      "Stay hydrated with water; sip slowly if nauseous",
      "Avoid spicy, fatty, or heavy foods until you see a doctor",
    ],
    "ENT Specialist": [
      "Stay hydrated and rest your voice if your throat is sore",
      "Use a humidifier or breathe steam for comfort",
      "Avoid smoke and very dry or dusty environments",
    ],
    Ophthalmologist: [
      "Rest your eyes and limit screen time when possible",
      "Avoid rubbing your eyes; use a clean, damp cloth if needed",
      "Wear sunglasses or reduce bright light if sensitivity is an issue",
    ],
    Pulmonologist: [
      "Rest and avoid heavy physical exertion",
      "Stay in well-ventilated spaces and avoid smoke or strong fumes",
      "Stay hydrated and breathe slowly if you feel short of breath",
    ],
    Psychiatrist: [
      "Stick to a regular sleep schedule as much as possible",
      "Spend some time outdoors or in natural light each day",
      "Stay in touch with people you trust; avoid isolating yourself",
    ],
    Pediatrician: [
      "Keep the child comfortable and offer small sips of water if allowed",
      "Note feeding, sleep, and temperature to share with the doctor",
      "Ensure a calm, restful environment and avoid overstimulation",
    ],
    Allergist: [
      "Avoid known triggers (e.g. pollen, dust) when you can",
      "Keep windows closed when pollen counts are high",
      "Shower or change clothes after being outdoors to reduce exposure",
    ],
    "General Physician": [
      "Stay hydrated and get adequate rest",
      "Eat light, balanced meals and avoid skipping meals",
      "Note when symptoms started and what makes them better or worse for your visit",
    ],
  };

  if (/\b(heart|chest|cardiac|palpitation|blood pressure|दिल|सीने|हृदय)\b/.test(text)) {
    recommendedDoctor = "Cardiologist";
  } else if (/\b(skin|rash|acne|mole|dermatitis|eczema|itch|त्वचा|चकत्ते|खुजली)\b/.test(text)) {
    recommendedDoctor = "Dermatologist";
  } else if (/\b(bone|joint|muscle|spine|fracture|arthritis|back pain|knee|shoulder|हड्डी|जोड़|मांसपेशी|पीठ)\b/.test(text)) {
    recommendedDoctor = "Orthopedic";
  } else if (/\b(headache|migraine|seizure|neurological|brain|memory|dizziness|numbness|सिरदर्द|माइग्रेन|चक्कर)\b/.test(text)) {
    recommendedDoctor = "Neurologist";
  } else if (/\b(stomach|digestion|nausea|vomit|diarrhea|constipation|abdomen|bloat|पेट|पाचन|उल्टी|दस्त)\b/.test(text)) {
    recommendedDoctor = "Gastroenterologist";
  } else if (/\b(ear|nose|throat|sinus|hearing|voice|tonsil|earache|sore throat|कान|नाक|गला|कान दर्द)\b/.test(text)) {
    recommendedDoctor = "ENT Specialist";
  } else if (/\b(eye|vision|sight|retina|glaucoma|conjunctivitis|red eye|आंख|दृष्टि|आँख)\b/.test(text)) {
    recommendedDoctor = "Ophthalmologist";
  } else if (/\b(cough|cold|flu|respiratory|asthma|breathing|lung|wheez|खांसी|सांस|जुकाम)\b/.test(text)) {
    recommendedDoctor = "Pulmonologist";
  } else if (/\b(anxiety|stress|sleep|mood|depress|mental|स्ट्रेस|नींद|मानसिक)\b/.test(text)) {
    recommendedDoctor = "Psychiatrist";
  } else if (/\b(baby|child|kid|pediatric|बच्चा|शिशु)\b/.test(text)) {
    recommendedDoctor = "Pediatrician";
  } else if (/\b(allergy|sneez|itching|एलर्जी)\b/.test(text)) {
    recommendedDoctor = "Allergist";
  }

  if (urgencyLevel === "Low") {
    selfCareTips = TIPS_BY_CATEGORY[recommendedDoctor] ?? TIPS_BY_CATEGORY["General Physician"];
  }

  return {
    recommendedDoctor,
    urgencyLevel,
    reason: `Based on what you described ("${shortDesc}"), a consultation with a ${recommendedDoctor} is recommended.`,
    selfCareTips,
    disclaimer: DEFAULT_RESPONSE.disclaimer,
  };
}

export async function POST(request) {
  let symptoms = null;
  try {
    const body = await request.json();
    symptoms = typeof body?.symptoms === "string" ? body.symptoms.trim() : null;
  } catch (_) {
    return NextResponse.json(DEFAULT_RESPONSE, { status: 200 });
  }

  if (!symptoms || symptoms.length === 0) {
    return NextResponse.json(DEFAULT_RESPONSE, { status: 200 });
  }

  try {
    const prompt = buildSymptomCheckerPrompt(symptoms);
    let aiResponse = await callGeminiAPI(prompt);

    if (!aiResponse) {
      aiResponse = getFallbackRecommendation(symptoms);
    }

    const urgencyLevel = validateUrgencyLevel(aiResponse.urgencyLevel);
    const validatedResponse = sanitizeResponse(aiResponse, urgencyLevel);
    return NextResponse.json(validatedResponse, { status: 200 });
  } catch (error) {
    return NextResponse.json(getFallbackRecommendation(symptoms), { status: 200 });
  }
}
