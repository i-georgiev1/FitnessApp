from flask import jsonify, request
from services.brevo_init import brevo_service
from sib_api_v3_sdk.rest import ApiException
import logging
import json
import traceback

# Set up a dedicated logger for contact form
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Make sure we have a console handler if not already present
if not logger.handlers:
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.DEBUG)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

class ContactFormService:
    @staticmethod
    def send_contact_form_email(contact_data):
        """
        Send contact form email using Brevo service
        Args:
            contact_data (dict): Dictionary containing contact form data
                - name: sender's name
                - email: sender's email
                - subject: email subject
                - message: email message
        Returns:
            tuple: (response dict, status code)
        """
        support_email_success = False
        auto_reply_success = False
        error_message = None
        
        try:
            # Log the incoming data
            logger.info(f"Contact form data received: {json.dumps(contact_data, default=str)}")
            
            # Validate required fields
            required_fields = ['name', 'email', 'subject', 'message']
            for field in required_fields:
                if field not in contact_data or not contact_data[field]:
                    logger.error(f"Missing required field: {field}")
                    return jsonify({
                        "status": "error",
                        "message": f"Missing required field: {field}"
                    }), 400

            # Get the API instance
            api_instance = brevo_service.get_api_instance()
            if not api_instance:
                logger.error("Brevo API instance is not initialized")
                return jsonify({
                    "status": "error",
                    "message": "Email service is not properly configured"
                }), 500

            # First, try to send the auto-reply email since we know it's working
            try:
                auto_reply = {
                    "sender": {
                        "email": "support@train-sync.com",
                        "name": "Train-Sync Support"
                    },
                    "to": [{
                        "email": contact_data["email"],
                        "name": contact_data["name"]
                    }],
                    "subject": "Thank you for contacting Train-Sync",
                    "htmlContent": f"""
                        <h3>Thank you for contacting Train-Sync</h3>
                        <p>Dear {contact_data['name']},</p>
                        <p>We have received your message and will get back to you as soon as possible.</p>
                        <p>Your message details:</p>
                        <p><strong>Subject:</strong> {contact_data['subject']}</p>
                        <p><strong>Message:</strong></p>
                        <p>{contact_data['message']}</p>
                        <br>
                        <p>Best regards,<br>Train-Sync Support Team</p>
                    """
                }
                
                logger.info("Sending auto-reply email...")
                auto_response = api_instance.send_transac_email(auto_reply)
                logger.info(f"Auto-reply email sent successfully to {contact_data['email']}")
                auto_reply_success = True
                
            except Exception as auto_reply_err:
                logger.error(f"Error sending auto-reply email: {str(auto_reply_err)}")
                error_message = f"Auto-reply failed: {str(auto_reply_err)}"
            
            # Now try to send the support email
            try:
                # Try a slightly different configuration for the support email
                support_email = {
                    "sender": {
                        "email": "support@train-sync.com", 
                        "name": "Train-Sync Form"
                    },
                    "to": [{
                        "email": "support@train-sync.com",
                        "name": "Train-Sync Support"
                    }],
                    # Set replyTo to the user's email
                    "replyTo": {
                        "email": contact_data["email"],
                        "name": contact_data["name"]
                    },
                    "subject": f"New Contact Form Message: {contact_data['subject']}",
                    "htmlContent": f"""
                        <h3>New Contact Form Submission</h3>
                        <p><strong>From:</strong> {contact_data['name']} ({contact_data['email']})</p>
                        <p><strong>Subject:</strong> {contact_data['subject']}</p>
                        <p><strong>Message:</strong></p>
                        <p>{contact_data['message']}</p>
                    """
                }

                logger.debug(f"Support email configuration: {json.dumps(support_email, default=str)}")
                logger.info("Sending email to support team...")
                
                support_response = api_instance.send_transac_email(support_email)
                logger.info(f"Support email sent successfully to support@train-sync.com")
                support_email_success = True
                
            except Exception as support_err:
                logger.error(f"Error sending support email: {str(support_err)}", exc_info=True)
                error_message = f"Support email failed: {str(support_err)}"
            
            # Determine the overall response
            if support_email_success and auto_reply_success:
                return jsonify({
                    "status": "success",
                    "message": "Contact form emails sent successfully"
                }), 200
            elif auto_reply_success:
                # Auto-reply worked but support email failed
                logger.warning("Only auto-reply email was sent successfully")
                return jsonify({
                    "status": "partial_success",
                    "message": "Your message was received, but there may be a delay in our response"
                }), 202
            else:
                # Neither worked
                logger.error("Both email sending attempts failed")
                return jsonify({
                    "status": "error",
                    "message": error_message or "Failed to send emails"
                }), 500

        except ApiException as e:
            error_details = {
                "status_code": e.status if hasattr(e, 'status') else "unknown",
                "reason": e.reason if hasattr(e, 'reason') else "unknown",
                "body": e.body if hasattr(e, 'body') else "unknown"
            }
            
            logger.error(f"Brevo API error details: {json.dumps(error_details, default=str)}")
            
            return jsonify({
                "status": "error",
                "message": f"Failed to send email: {str(e)}"
            }), 500
            
        except Exception as e:
            logger.error(f"Unexpected error in contact form service: {str(e)}")
            logger.error(traceback.format_exc())
            
            return jsonify({
                "status": "error",
                "message": "An unexpected error occurred while processing your request"
            }), 500


# Flask route handler
def handle_contact_form():
    """
    Flask route handler for contact form submissions
    """
    if request.method != 'POST':
        return jsonify({
            "status": "error",
            "message": "Method not allowed"
        }), 405
    
    try:
        logger.info(f"Received contact form submission")
        
        # Get the request data
        contact_data = request.get_json()
        
        if not contact_data:
            logger.error("No JSON data provided in request")
            return jsonify({
                "status": "error", 
                "message": "No JSON data provided"
            }), 400
        
        logger.info(f"Processing contact form with data: {json.dumps(contact_data, default=str)}")
        return ContactFormService.send_contact_form_email(contact_data)
        
    except Exception as e:
        logger.error(f"Error processing contact form request: {str(e)}")
        logger.error(traceback.format_exc())
        
        return jsonify({
            "status": "error",
            "message": "Failed to process contact form submission"
        }), 500

# Create a singleton instance of the service
contact_form_service = ContactFormService()
