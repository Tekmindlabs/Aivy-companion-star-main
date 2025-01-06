declare module 'ai' {
    export interface Message {
      id: string;
      role: 'system' | 'user' | 'assistant';
      content: string;
      createdAt?: Date | number;
    }
  
    export interface LangChainStreamCallbacks {
      handleLLMNewToken: (token: string) => Promise<void>;
      handleLLMEnd: (message: Message, runId: string) => Promise<void>;
    }
  
    export function LangChainStream(options?: {
      experimental_streamData?: boolean;
    }): {
      stream: ReadableStream;
      handlers: LangChainStreamCallbacks;
    };
  
    export class StreamingTextResponse extends Response {
      constructor(stream: ReadableStream, init?: ResponseInit);
      clone(): Response;
    }
  }