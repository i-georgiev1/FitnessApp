from sib_api_v3_sdk import Configuration, ApiClient, TransactionalEmailsApi
from sib_api_v3_sdk.rest import ApiException
from typing import Optional
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))



class BrevoService:
    def __init__(self):
        self.configuration = None
        self.api_instance = None
        self.initialize_brevo()

    def initialize_brevo(self) -> None:
        """
        Initialize Brevo API configuration using API key from environment variables
        """
        api_key = os.getenv('BREVO_API_KEY')
        if not api_key:
            raise ValueError("BREVO_API_KEY environment variable is not set")
        
        # Validate API key format
        if api_key.startswith('xsmtpsib-'):
            raise ValueError("Invalid API key format. You are using an SMTP key. Please use a v3 API key that starts with 'xkeysib-'")
        
        if not api_key.startswith('xkeysib-'):
            raise ValueError("Invalid API key format. API key should start with 'xkeysib-'")
        
        # Additional debug information
        print(f"API Key first 4 characters: {api_key[:4]}...")
        print(f"API Key length: {len(api_key)}")
        
        try:
            self.configuration = Configuration()
            self.configuration.api_key['api-key'] = api_key
            
            # Create an instance of the API class
            api_client = ApiClient(self.configuration)
            self.api_instance = TransactionalEmailsApi(api_client)
            
            # Validate API key with better error handling
            try:
                print("Attempting to validate API key...")
                response = self.api_instance.get_smtp_templates()
                print("BREVO API key validation successful")
                print(f"Successfully connected to Brevo API for account")
            except ApiException as e:
                print(f"API Exception details:")
                print(f"Status: {e.status}")
                print(f"Reason: {e.reason}")
                print(f"Body: {e.body}")
                print(f"Headers: {e.headers}")
                if e.status == 401:
                    raise ValueError(f"Invalid Brevo API key. Server response: {e.body}")
                raise
        except Exception as e:
            print(f"Error initializing Brevo: {str(e)}")
            raise

    def get_api_instance(self) -> Optional[TransactionalEmailsApi]:
        """
        Get the initialized Brevo API instance
        Returns:
            TransactionalEmailsApi: Initialized Brevo API instance
        """
        return self.api_instance

# Create a singleton instance
brevo_service = BrevoService()

