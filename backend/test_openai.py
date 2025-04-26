import os
import sys
from dotenv import load_dotenv
from services.openai_service import OpenAIService
import json

# Load environment variables
load_dotenv()

def test_generate_response():
    """Test the basic response generation functionality"""
    print("Testing basic response generation...")
    
    prompt = "What are some good exercises for beginners?"
    response = OpenAIService.generate_response(prompt)
    
    print(f"Model used: {response.get('model', 'unknown')}")
    print(f"Token usage: {response.get('usage', {})}")
    print("\nResponse content:")
    print("-" * 50)
    print(response.get('content', 'No content returned'))
    print("-" * 50)
    
    return response

def test_generate_fitness_plan():
    """Test the fitness plan generation functionality"""
    print("\nTesting fitness plan generation...")
    
    user_info = {
        "age": 30,
        "weight": "70kg",
        "height": "175cm",
        "fitness_level": "beginner"
    }
    
    goals = "Lose weight and build muscle"
    preferences = "Home workouts, minimal equipment"
    constraints = "Limited time, knee injury"
    
    response = OpenAIService.generate_fitness_plan(
        user_info=user_info,
        goals=goals,
        preferences=preferences,
        constraints=constraints
    )
    
    print(f"Model used: {response.get('model', 'unknown')}")
    print(f"Token usage: {response.get('usage', {})}")
    print("\nFitness Plan:")
    print("-" * 50)
    print(response.get('content', 'No content returned'))
    print("-" * 50)
    
    return response

if __name__ == "__main__":
    # Check if OpenAI API key is set
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("Error: OPENAI_API_KEY environment variable is not set.")
        sys.exit(1)
    
    print(f"Using OpenAI API key: {api_key[:5]}...{api_key[-4:]}")
    
    # Run tests
    test_generate_response()
    test_generate_fitness_plan()
    
    print("\nAll tests completed successfully!") 