const sendVerificationEmail = (username, baseUrl) => {
    const verificationLink = baseUrl;
  
   return `
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Verification</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f3f4f6;
                  color: #333;
                  margin: 0;
                  padding: 20px;
              }
              .container {
                  background-color: white;
                  border-radius: 8px;
                  box-shadow: 0 0 10px rgba(0,0,0,0.1);
                  padding: 30px;
                  max-width: 600px;
                  margin: auto;
              }
              h1 {
                  color: #007bff;
              }
              p {
                  font-size: 16px;
              }
              .button {
                  background-color: #007bff;
                  color: white;
                  padding: 15px 25px;
                  border-radius: 5px;
                  text-decoration: none;
                  font-size: 16px;
                  display: inline-block;
              }
              .footer {
                  margin-top: 30px;
                  font-size: 12px;
                  color: #777;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>Hello, ${username}!</h1>
              <p>Thank you for signing up with us. To complete your registration, please verify your email by clicking the button below.</p>
              <a href="${verificationLink}" class="button">Verify Your Account</a>
              <p>If you did not request an account, please ignore this email.</p>
              <div class="footer">
                  <p>Best regards,</p>
                  <p>Your Tickets Booking</p>
              </div>
          </div>
      </body>
      </html>
    `;
  };

  module.exports = sendVerificationEmail;
  