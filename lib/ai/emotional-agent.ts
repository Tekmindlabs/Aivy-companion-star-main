import { GoogleGenerativeAI } from "@google/generative-ai";

interface EmotionalState {
  mood: string;
  confidence: string;
}

interface EmotionalAnalysis {
  emotionalState: EmotionalState;
  analysis: string;
}

// Utility function to extract emotional tone from analysis
const extractEmotionalTone = (analysis: string): string => {
  const lowerAnalysis = analysis.toLowerCase();
  
  // Primary emotions mapping
  const emotionMap = {
    positive: ['joy', 'happy', 'excited', 'enthusiastic', 'content', 'pleased'],
    negative: ['sad', 'anxious', 'frustrated', 'angry', 'worried', 'stressed'],
    neutral: ['calm', 'neutral', 'balanced', 'steady', 'composed']
  };

  // Check for primary emotions
  for (const [tone, emotions] of Object.entries(emotionMap)) {
    if (emotions.some(emotion => lowerAnalysis.includes(emotion))) {
      return tone;
    }
  }

  // Secondary analysis based on general sentiment
  if (lowerAnalysis.includes('positive')) return 'positive';
  if (lowerAnalysis.includes('negative')) return 'negative';
  
  // Default fallback
  return 'neutral';
};

// Utility function to extract confidence level from analysis
const extractConfidenceLevel = (analysis: string): string => {
  const lowerAnalysis = analysis.toLowerCase();
  
  // Confidence indicators mapping
  const confidenceIndicators = {
    high: [
      'very confident',
      'high confidence',
      'strong indication',
      'clearly shows',
      'definitely'
    ],
    low: [
      'low confidence',
      'uncertain',
      'unclear',
      'might be',
      'possibly',
      'not sure'
    ]
  };

  // Check for high confidence indicators
  if (confidenceIndicators.high.some(indicator => lowerAnalysis.includes(indicator))) {
    return 'high';
  }

  // Check for low confidence indicators
  if (confidenceIndicators.low.some(indicator => lowerAnalysis.includes(indicator))) {
    return 'low';
  }

  // Default to medium if no clear indicators
  return 'medium';
};

export const createEmotionalAgent = (model: any) => {
  return async (state: any): Promise<EmotionalAnalysis> => {
    try {
      const prompt = `
        As an emotionally intelligent AI companion, analyze the emotional context and personal state of our conversation:
        ${state.messages.map((m: any) => `${m.role}: ${m.content}`).join('\n')}
        
        Please provide a detailed analysis of:
        1. Emotional State:
           - Primary emotion (joy, sadness, anxiety, excitement, etc.)
           - Emotional intensity (high/medium/low)
           - Underlying feelings or concerns
        
        2. Personal Context:
           - Current mood and energy level
           - Signs of stress or well-being
           - Social and emotional needs
           - Communication preferences
        
        3. Relationship Dynamic:
           - Level of openness and trust
           - Engagement in conversation
           - Areas where support is needed
        
        Format the response as:
        {
          "emotionalState": {
            "mood": "[primary emotion]",
            "intensity": "[high/medium/low]",
            "confidence": "[high/medium/low]"
          },
          "analysis": "[detailed emotional and contextual analysis]"
        }
      `;

      const result = await model.generateContent(prompt);
      const analysis = result.response.text();

      // Parse the emotional state using utility functions
      const emotionalState = {
        mood: extractEmotionalTone(analysis),
        confidence: extractConfidenceLevel(analysis)
      };

      // Validate the analysis format
      let parsedAnalysis = analysis;
      try {
        const jsonMatch = analysis.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          parsedAnalysis = parsed.analysis || analysis;
        }
      } catch (parseError) {
        console.warn("Failed to parse JSON from analysis, using raw text");
      }

      return {
        emotionalState,
        analysis: parsedAnalysis
      };

    } catch (error) {
      console.error("Emotional analysis error:", error);
      return {
        emotionalState: {
          mood: "neutral",
          confidence: "medium"
        },
        analysis: "Error analyzing emotional state"
      };
    }
  };
};