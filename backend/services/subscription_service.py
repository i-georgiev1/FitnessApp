import os
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)

class SubscriptionService:
    def __init__(self, environment):
        self.environment = environment
        self.sender_email = os.getenv('EMAIL_USER')
        self.sender_password = os.getenv('EMAIL_PASSWORD')
        self.receiver_email = os.getenv('ADMIN_EMAIL')

    def process_subscription(self, name, email):
        try:
            logger.info(f"Processing subscription for {email} in {self.environment} environment")
            
            if not all([name, email]):
                logger.error("Missing required fields")
                return False, "Name and email are required"
                
            return self._send_notification_email(name, email)
            
        except Exception as e:
            error_msg = f"Subscription processing error: {str(e)}"
            logger.error(error_msg)
            return False, error_msg

    def _send_notification_email(self, name, email):
        if not all([self.sender_email, self.sender_password, self.receiver_email]):
            logger.error("Missing email configuration")
            return False, "Missing email configuration"
        
        message = MIMEMultipart()
        message["From"] = self.sender_email
        message["To"] = self.receiver_email
        message["Subject"] = f"New Subscription from Website ({self.environment})"
        
        html = f"""
        <html>
            <body>
                <h2>New Subscription ({self.environment.title()} Environment)</h2>
                <p>You have received a new subscription from the website:</p>
                <ul>
                    <li><strong>Name:</strong> {name}</li>
                    <li><strong>Email:</strong> {email}</li>
                </ul>
            </body>
        </html>
        """
        
        message.attach(MIMEText(html, "html"))
        
        try:
            logger.info(f"Attempting to send email to {self.receiver_email}")
            server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
            server.login(self.sender_email, self.sender_password)
            server.send_message(message)
            server.quit()
            logger.info("Email sent successfully")
            return True, "Email sent successfully"
        except Exception as e:
            error_msg = f"Error sending email: {str(e)}"
            logger.error(error_msg)
            return False, error_msg 