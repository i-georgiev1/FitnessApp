from .brevo_init import brevo_service
from sib_api_v3_sdk import SendSmtpEmail
from sib_api_v3_sdk.rest import ApiException


class EmailService:
    def __init__(self):
        self.api_instance = brevo_service.get_api_instance()
        
        

    def send_email(self, to_email: str, subject: str, html_content: str, sender_name: str = "TrainSync - System") -> bool:
        """
        Send an email using Brevo
        
        Args:
            to_email (str): Recipient email address
            subject (str): Email subject
            html_content (str): HTML content of the email
            sender_name (str): Name of the sender (defaults to "TrainSync")
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        try:
            sender = {"name": sender_name, "email": "no-reply@train-sync.com"}
            to = [{"email": to_email}]
            
            

            email = SendSmtpEmail(
                sender=sender,
                to=to,
                subject=subject,
                html_content=html_content
            )
            
            # Send the email
            self.api_instance.send_transac_email(email)
            return True
            
        except ApiException as e:
            print(f"Exception when sending email: {e}")
            return False
            
    
# Usage example:
"""
email_service = EmailService()

# Example: Sending a welcome email
welcome_html = '''
    <html>
        <body>
            <h1>Welcome to TrainSync!</h1>
            <p>Thank you for joining our platform.</p>
        </body>
    </html>
'''

success = email_service.send_email(
    to_email="user@example.com",
    subject="Welcome to TrainSync",
    html_content=welcome_html
)

if success:
    print("Email sent successfully!")
else:
    print("Failed to send email")
"""

