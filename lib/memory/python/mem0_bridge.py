
import sys
import json
import os
from mem0ai import Mem0AI as Memory  # Updated import
import logging
import datetime
from typing import Optional, Dict, Any
import google.generativeai as genai



# Enhanced logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class Mem0Bridge:
    def __init__(self):
        """Initialize the Mem0Bridge with configuration and memory system."""
        try:
            # Configuration for Google Gen AI, Milvus and Jina
            self.config = {
                "llm": {
                    "provider": "google",
                    "config": {
                        "api_key": os.getenv("GOOGLE_API_KEY"),
                        "model": "gemini-pro",
                        "temperature": 0.1,
                        "max_tokens": 2000,
                    }
                },
                "embedder": {
                    "provider": "jina",
                    "config": {
                        "model": "jina-embeddings-v2-base-en"
                    }
                },
                "vector_store": {
                    "provider": "milvus",
                    "config": {
                        "collection_name": "aivy_memories",
                        "url": os.getenv("MILVUS_URL"),
                        "embedding_model_dims": 768,
                        "token": os.getenv("MILVUS_TOKEN"),
                        "metric_type": "L2"
                    }
                },
                "version": "v1.1"
            }
            
            # Initialize Google Gen AI
            genai.configure(api_key=self.config["llm"]["config"]["api_key"])
            
            # Initialize memory system
            self.memory = Memory.from_config(self.config)
            logger.info("Memory system initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Memory system: {str(e)}")
            self.memory = None
            raise

    def _check_memory_initialized(self):
        """Helper method to check if memory system is initialized."""
        if not self.memory:
            raise Exception("Memory system not initialized")

    def add_memory(self, content: str, user_id: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Add a memory entry for a user.
        
        Args:
            content: The content to store
            user_id: The user's identifier
            metadata: Optional metadata dictionary
        
        Returns:
            Dictionary containing success status and result/error
        """
        try:
            self._check_memory_initialized()
            
            if not content or not user_id:
                raise ValueError("Content and user_id cannot be empty")

            metadata = metadata or {}
            metadata['timestamp'] = datetime.datetime.utcnow().isoformat()
            
            result = self.memory.add(
                content=content,
                user_id=user_id,
                metadata=metadata
            )
            
            return {
                "success": True,
                "result": result
            }
        except Exception as e:
            logger.error(f"Add memory error: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

    def search_memories(self, query: str, user_id: str, limit: int = 5) -> Dict[str, Any]:
        """
        Search for memories based on query.
        
        Args:
            query: Search query string
            user_id: The user's identifier
            limit: Maximum number of results to return
            
        Returns:
            Dictionary containing success status and results/error
        """
        try:
            self._check_memory_initialized()
            
            if not query or not user_id:
                raise ValueError("Query and user_id cannot be empty")
            
            if limit < 1:
                raise ValueError("Limit must be greater than 0")
            
            results = self.memory.search(
                query=query,
                user_id=user_id,
                limit=limit
            )
            
            return {
                "success": True,
                "results": results.get("results", [])
            }
        except Exception as e:
            logger.error(f"Search error: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

    def delete_memory(self, user_id: str, memory_id: str) -> Dict[str, Any]:
        """
        Delete a specific memory entry.
        
        Args:
            user_id: The user's identifier
            memory_id: The memory entry identifier
            
        Returns:
            Dictionary containing success status and result/error
        """
        try:
            self._check_memory_initialized()
            
            if not user_id or not memory_id:
                raise ValueError("User_id and memory_id cannot be empty")

            result = self.memory.delete(memory_id=memory_id, user_id=user_id)
            
            return {
                "success": True,
                "result": result
            }
        except Exception as e:
            logger.error(f"Delete error: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

def main():
    """Main entry point for the bridge script."""
    try:
        if len(sys.argv) < 3:
            raise ValueError("Usage: script.py <command> <json_args>")

        command = sys.argv[1].lower()
        try:
            args = json.loads(sys.argv[2])
        except json.JSONDecodeError:
            raise ValueError("Invalid JSON arguments")

        bridge = Mem0Bridge()

        result = None
        if command == "search":
            if not all(k in args for k in ["query", "userId"]):
                raise ValueError("Missing required arguments for search")
            result = bridge.search_memories(
                query=args["query"],
                user_id=args["userId"],
                limit=args.get("limit", 5)
            )
        elif command == "add":
            if not all(k in args for k in ["content", "userId"]):
                raise ValueError("Missing required arguments for add")
            result = bridge.add_memory(
                content=args["content"],
                user_id=args["userId"],
                metadata=args.get("metadata", {})
            )
        elif command == "delete":
            if not all(k in args for k in ["userId", "memoryId"]):
                raise ValueError("Missing required arguments for delete")
            result = bridge.delete_memory(
                user_id=args["userId"],
                memory_id=args["memoryId"]
            )
        else:
            result = {
                "success": False,
                "error": f"Unknown command: {command}"
            }
        
        print(json.dumps(result))

    except Exception as e:
        logger.error(f"Main execution error: {str(e)}")
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()