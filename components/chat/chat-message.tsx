import { Message } from "ai";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Bot, User } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReActStep {
  thought: string;
  action: string;
  observation: string;
}

interface EnhancedMessage extends Message {
  reactSteps?: ReActStep[];
}

interface ChatMessageProps {
  message: EnhancedMessage;
  isLoading?: boolean;
}

interface CodeProps {
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export function ChatMessage({ message, isLoading }: ChatMessageProps) {
  const [formattedContent, setFormattedContent] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
    
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (typeof message.content === 'string') {
      try {
        // Clean up the content
        let cleanContent = message.content
          .replace(/^\d+:/, '') // Remove numeric prefix
          .replace(/\\n/g, '\n') // Replace escaped newlines
          .trim();

        // Handle potential JSON content
        if (cleanContent.startsWith('{') && cleanContent.endsWith('}')) {
          try {
            const parsed = JSON.parse(cleanContent);
            cleanContent = parsed.content || cleanContent;
          } catch {
            // If JSON parsing fails, use the cleaned content as is
          }
        }

        // Process markdown formatting
        cleanContent = cleanContent
          .replace(/\*\*(.*?)\*\*/g, '**$1**') // Bold
          .replace(/\*(.*?)\*/g, '_$1_') // Italic
          .replace(/```([\s\S]*?)```/g, (_, code) => `\n\`\`\`\n${code.trim()}\n\`\`\`\n`); // Code blocks

        setFormattedContent(cleanContent);
      } catch {
        setFormattedContent(message.content);
      }
    }
  }, [message.content]);

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={messageRef}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={messageVariants}
        transition={{ duration: 0.3 }}
        className={cn(
          "flex items-start gap-4 p-4 relative",
          message.role === "user" ? "justify-end" : "justify-start"
        )}
      >
        {message.role === "assistant" && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-md"
          >
            <Bot className="h-4 w-4 text-white" />
          </motion.div>
        )}

        <div className="flex flex-col gap-2 max-w-[80%]">
          {message.reactSteps && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-sm bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-3 mb-2 shadow-sm"
            >
              <div className="font-semibold mb-2 text-blue-600 dark:text-blue-400">
                Reasoning Steps:
              </div>
              {message.reactSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="mb-2 pl-2 border-l-2 border-blue-400"
                >
                  <div className="text-primary font-medium">💭 {step.thought}</div>
                  <div className="text-success">🎯 {step.action}</div>
                  <div className="text-info">👁️ {step.observation}</div>
                </motion.div>
              ))}
            </motion.div>
          )}

          <Card
            className={cn(
              "p-4 transition-all duration-200 ease-in-out",
              message.role === "user" 
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/20" 
                : "bg-white dark:bg-gray-800 shadow-md"
            )}
          >
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  code: ({ className, children, ...props }: CodeProps) => {
                    const isInline = !className;
                    return (
                      <code
                        className={cn(
                          "rounded px-1.5 py-0.5",
                          isInline
                            ? "bg-gray-200 dark:bg-gray-700 text-sm"
                            : "block p-4 text-sm bg-gray-900 text-gray-100 overflow-x-auto"
                        )}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  p: ({ children }) => (
                    <p className="mb-4 leading-relaxed">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc ml-6 mb-4">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal ml-6 mb-4">{children}</ol>
                  ),
                }}
              >
                {formattedContent}
              </ReactMarkdown>
            </div>

            {isLoading && (
              <div className="mt-2 flex gap-1.5">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="h-2 w-2 rounded-full bg-blue-400/60"
                />
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                  className="h-2 w-2 rounded-full bg-blue-400/60"
                />
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                  className="h-2 w-2 rounded-full bg-blue-400/60"
                />
              </div>
            )}
          </Card>
        </div>

        {message.role === "user" && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-700 shadow-md"
          >
            <User className="h-4 w-4 text-white" />
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}