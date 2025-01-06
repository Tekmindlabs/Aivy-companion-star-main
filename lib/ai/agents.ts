import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message } from "@/types/chat";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

// Define base types
export type AgentRole = 'companion' | 'emotional' | 'support' | 'memory' | 'engagement';

export interface EmotionalState {
  mood: string;
  confidence: string;
}

export interface ReActStep {
  thought: string;
  action: string;
  observation: string;
  response?: string;
}

// Base state interface
// Update the AgentState interface in agents.ts
export interface AgentState {
  messages: Message[];
  currentStep: string;
  emotionalState: EmotionalState;
  context: {
    role: AgentRole;
    analysis: {
      emotional?: string;
      research?: string;
      validation?: string;
    };
    recommendations?: string;
    personalPreferences: {
      interests?: string[];
      communicationStyle?: string;
      emotionalNeeds?: string[];
      dailyRoutines?: string[];
      supportPreferences?: string[];
    };
    relationshipDynamics: {
      trustLevel?: string;
      engagementStyle?: string;
      connectionStrength?: string;
      interactionHistory?: string[];
    };
  };
  reactSteps?: ReActStep[];
}

export interface HybridState extends AgentState {
  reactSteps: ReActStep[];
}
// Response interface extending the base state
export interface AgentResponse extends AgentState {
  success: boolean;
  timestamp: string;
  response?: string;
  error?: string;
  metadata?: {
    processingTime?: number;
    confidence?: number;
    source?: string;
  };
}

// Emotional agent implementation
export const createEmotionalAgent = (model: any) => {
  return async (state: AgentState): Promise<AgentResponse> => {
    const startTime = Date.now();
    const latestMessage = state.messages[state.messages.length - 1];

    try {
      const result = await model.generateContent(`
        Analyze the emotional state and learning mindset of the student based on this message:
        "${latestMessage}"
        
        Provide:
        1. Emotional state (positive/negative/neutral)
        2. Confidence level (high/medium/low)
        3. Brief analysis of emotional context
      `);

      const analysis = result.response.text();
      
      // Parse emotional state
      const emotionalState: EmotionalState = {
        mood: analysis.toLowerCase().includes('positive') ? 'positive' :
              analysis.toLowerCase().includes('negative') ? 'negative' : 'neutral',
        confidence: analysis.toLowerCase().includes('high') ? 'high' :
                   analysis.toLowerCase().includes('low') ? 'low' : 'medium'
      };

      return {
        ...state,
        emotionalState,
        success: true,
        timestamp: new Date().toISOString(),
        metadata: {
          processingTime: Date.now() - startTime,
          confidence: emotionalState.confidence === 'high' ? 0.9 :
                     emotionalState.confidence === 'medium' ? 0.7 : 0.5,
          source: 'emotional-agent'
        }
      };
    } catch (error) {
      console.error("Emotional agent error:", error);
      
      return {
        ...state,
        emotionalState: { mood: 'neutral', confidence: 'medium' },
        success: false,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          processingTime: Date.now() - startTime,
          confidence: 0,
          source: 'emotional-agent'
        }
      };
    }
  };
};

// Export type for hybrid agent
export interface HybridState extends AgentState {
  reactSteps: ReActStep[];
}

// Export type for hybrid agent response
export interface HybridResponse extends AgentResponse {
  reactSteps: ReActStep[];
}

// Utility function to create base agent state
export const createInitialAgentState = (
  messages: Message[], 
  role: AgentRole = 'companion'
): AgentState => ({
  messages,
  currentStep: 'initial',
  emotionalState: {
    mood: 'welcoming',
    confidence: 'medium'
  },
  context: {
    role,
    analysis: {},
    recommendations: '',
    personalPreferences: {
      interests: [],
      communicationStyle: 'adaptive',
      emotionalNeeds: [],
      dailyRoutines: [],
      supportPreferences: []
    },
    relationshipDynamics: {
      trustLevel: 'building',
      engagementStyle: 'adaptive',
      connectionStrength: 'initial',
      interactionHistory: []
    }
  }
});