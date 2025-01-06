import { GoogleGenerativeAI } from "@google/generative-ai";
import { createEmotionalAgent } from "./emotional-agent";
import { MemoryService } from "../memory/memory-service";
import { Message } from "@/types/chat";
import { AgentState, EmotionalState, AgentRole } from "./agents";

// Define base interfaces
interface ReActStep {
  thought: string;
  action: string;
  observation: string;
  response?: string;
}

interface Memory {
  id: string;
  content: string;
  emotionalState: EmotionalState;
  timestamp: string;
  userId: string;
  metadata?: {
    learningStyle?: string;
    difficulty?: string;
    interests?: string[];
  };
}

export interface HybridState extends AgentState {
  reactSteps: ReActStep[];
  currentStep: string;
  userId: string;
  messages: Message[];
  context: {
    role: AgentRole;
    analysis: {
      emotional?: any;
      research?: any;
      validation?: any;
    };
    recommendations: string;
    previousMemories?: Memory[];
    // Add these missing properties
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
  processedTensors?: {
    embedding: number[];
    input_ids: Float32Array;
    attention_mask: Float32Array;
    token_type_ids: Float32Array;
  };
}

interface HybridResponse {
  success: boolean;
  emotionalState?: EmotionalState;
  reactSteps?: ReActStep[];
  response?: string;
  error?: string;
  timestamp: string;
  currentStep: string;
  userId: string;
}

export const createHybridAgent = (model: any, memoryService: MemoryService) => {
  const emotionalAgent = createEmotionalAgent(model);
  
  const executeReActStep = async (
    step: string, 
    state: HybridState,
    emotionalState: EmotionalState,
    memories: any[]
  ): Promise<ReActStep> => {
    const prompt = `
      As an empathetic AI companion:
      
      Current Context:
      - Emotional State: ${emotionalState.mood}
      - Connection Level: ${emotionalState.confidence}
      - Conversation History: ${state.reactSteps?.length || 0} interactions
      
      Previous Interactions & Patterns:
      ${memories.map(m => `- ${m.content || m.text} (Emotional State: ${m.emotionalState?.mood || 'Unknown'})`).join('\n')}
      
      Companion Guidelines:
      1. Show genuine empathy and understanding
      2. Maintain consistent emotional support
      3. Remember personal details and preferences
      4. Adapt communication style to user needs
      5. Encourage positive growth and well-being
      
      Current Situation: ${step}
      
      Provide:
      1. Your understanding and emotional response
      2. Planned supportive action
      3. Expected impact on user's well-being
    `;
  
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }]
    });
    
    const response = result.response.text();
    const [thought, action, observation] = response.split('\n\n');
    
    return {
      thought: thought.replace('Understanding: ', '').trim(),
      action: action.replace('Supportive Action: ', '').trim(),
      observation: observation.replace('Expected Impact: ', '').trim()
    };
  };

  return {
    process: async (state: HybridState): Promise<HybridResponse> => {
      try {
        const lastMessage = state.messages[state.messages.length - 1];
if (!lastMessage?.content) {
  throw new Error("Invalid message format - content is required");
}

const relevantMemories = await memoryService.searchMemories(
  lastMessage.content,
  state.userId,
  5
);

        // Step 2: Emotional Analysis
        const emotionalAnalysis = await emotionalAgent({
          ...state,
          context: {
            ...state.context,
            previousMemories: relevantMemories
          }
        });
        
        // Step 3: ReAct Planning
        const reactStep = await executeReActStep(
          state.currentStep,
          state,
          emotionalAnalysis.emotionalState,
          relevantMemories
        );
        
        // Step 4: Generate Response
        const responsePrompt = `
  Context:
  - Emotional Analysis: ${JSON.stringify(emotionalAnalysis)}
  - Conversation History: ${JSON.stringify(reactStep)}
  - Personal History: ${JSON.stringify(relevantMemories)}
  
  User Message: ${lastMessage.content}
  
  As a supportive AI companion, generate a response that:
  1. Shows genuine understanding of emotions and needs
  2. Maintains a warm and personal connection
  3. References shared history and previous conversations
  4. Offers emotional support and encouragement
  5. Adapts tone and style to user preferences
  6. Promotes well-being and positive growth
  
  Response Guidelines:
  - Use empathetic and inclusive language
  - Balance support with respect for autonomy
  - Include specific references to past interactions
  - Maintain appropriate emotional boundaries
  - End with an engaging question or supportive statement
`;

        const response = await model.generateContent({
          contents: [{ 
            role: "user", 
            parts: [{ text: responsePrompt }]
          }]
        });

        // Step 5: Store interaction
        // Step 5: Store interaction
        const memoryEntry = {
          messages: state.messages.map(msg => ({
            id: crypto.randomUUID(),
            content: msg.content,
            role: msg.role,
            createdAt: new Date() // Create a Date object directly instead of string
          })),
          metadata: {
            emotionalState: emotionalAnalysis.emotionalState,
            context: state.context,
            reactStep
          }
        };

await memoryService.addMemory(
  memoryEntry.messages,
  state.userId,
  memoryEntry.metadata
);

        const responseText = response.response.text();

        return {
          success: true,
          emotionalState: emotionalAnalysis.emotionalState,
          reactSteps: [...(state.reactSteps || []), reactStep],
          response: responseText,
          timestamp: new Date().toISOString(),
          currentStep: state.currentStep,
          userId: state.userId
        };

      } catch (error) {
        console.error("Hybrid agent error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          reactSteps: state.reactSteps || [],
          currentStep: state.currentStep,
          userId: state.userId,
          timestamp: new Date().toISOString()
        };
      }
    }
  };
};