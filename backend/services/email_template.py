

class EmailTemplate:
    def __init__(self, first_name, second_name):
        self.first_name = first_name
        self.second_name = second_name
        
        

    def welcome_mail(self):
        return f"""
            <!DOCTYPE html>
            <html lang="en">

            <head>
                <title>Welcome to Train-Sync!</title>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>

            <body style="background-color: #f9f9f9; margin: 0; padding: 0; font-family: Arial, sans-serif;">

                <!-- Main Container -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9;">
                    <tr>
                        <td align="center">

                            <!-- Spacer -->
                            <table width="700" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding: 5px 0;">
                                        <div style="height:10px;line-height:10px;font-size:1px;">&#8202;</div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Logo Section -->
                            <table width="700" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
                                <tr>
                                    <td align="center" style="padding: 20px;">
                                        <img src="https://train-sync.com/assets/train-sync-high-resolution-logo-Photoroom-tA3mG0oe.png" alt="Train-Sync Logo" width="154" style="display: block; height: auto; border: 0;">
                                    </td>
                                </tr>
                            </table>

                            <!-- Welcome Section -->
                            <table width="700" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffd3e0;">
                                <tr>
                                    <td align="center" style="padding: 30px 40px;">
                                        <img src="https://d1oco4z2z1fhwp.cloudfront.net/templates/default/1561/Welcome_Email.png" alt="Welcome" width="420" style="display: block; height: auto; border: 0;">
                                        <h1 style="color: #191919; font-size: 38px; line-height: 150%; margin: 20px 0 10px;">Hi {self.first_name} {self.second_name}, welcome to Train-Sync!</h1>
                                        <p style="color: #191919; font-size: 22px; line-height: 120%; margin: 0;">Thank you for subscribing!</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Footer Section -->
                            <table width="700" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
                                <tr>
                                    <td align="center" style="padding: 25px 40px;">
                                        <p style="color: #555555; font-size: 14px; line-height: 200%; margin: 0;">
                                            If you have any questions, feel free to message us at support@train-sync.com. All rights reserved. Update <a href="#" style="text-decoration: none; color: #555555;">email preferences</a> or <a href="#" style="text-decoration: none; color: #555555;">unsubscribe</a>.
                                        </p>
                                      <p style="color: #555555; font-size: 14px; line-height: 200%; margin: 10px 0 0;">
                                         Sofia, Studentski grad 1700
                                    </p>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                </table>

            </body>

            </html>


        
        """

    