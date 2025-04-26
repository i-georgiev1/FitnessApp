import os
import openai
from dotenv import load_dotenv
import logging
from typing import Dict, Any, List, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize OpenAI client with better error handling
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    logger.error("OPENAI_API_KEY environment variable is not set")
    raise ValueError("OPENAI_API_KEY environment variable is not set")

try:
    client = openai.OpenAI(api_key=api_key)
except Exception as e:
    logger.error(f"Failed to initialize OpenAI client: {str(e)}")
    raise

class OpenAIService:
    """
    Service for interacting with OpenAI API.
    """
    
    @staticmethod
    def generate_response(
        prompt: str,
        model: str = "gpt-4o-mini",
        max_tokens: int = 1000,
        temperature: float = 0.7,
        system_message: Optional[str] = None,
        user_message_history: Optional[List[Dict[str, str]]] = None,
        timeout: int = 30  # 30 seconds timeout
    ) -> Dict[str, Any]:
        """
        Generate a response using OpenAI's GPT models.
        
        Args:
            prompt (str): The user's input prompt
            model (str): The model to use, default is gpt-4o-mini
            max_tokens (int): Maximum number of tokens to generate
            temperature (float): Controls randomness (0-1)
            system_message (str, optional): System message to set context
            user_message_history (List[Dict[str, str]], optional): Previous conversation history
            timeout (int): Timeout in seconds for the API call
            
        Returns:
            Dict[str, Any]: The response from the OpenAI API
        """
        try:
            messages = []
            
            # Add system message if provided
            if system_message:
                messages.append({"role": "system", "content": system_message})
            
            # Add message history if provided
            if user_message_history:
                messages.extend(user_message_history)
            
            # Add the current user prompt
            messages.append({"role": "user", "content": prompt})
            
            # Make the API call with timeout
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                timeout=timeout
            )
            
            # Extract and return the response content
            result = {
                "content": response.choices[0].message.content,
                "model": model,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                }
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Error generating OpenAI response: {str(e)}")
            return {"error": str(e)}

# Example usage
if __name__ == "__main__":
    # Test the service
    response = OpenAIService.generate_response("What are some good exercises for beginners?")
    print(response["content"]) 