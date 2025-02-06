const sendTicketConfirmationEmail = (ticketDetails) => {
  const ticketTemplate = `
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Ticket Purchase Confirmation</title>
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
                  color: #28a745;
              }
              p {
                  font-size: 16px;
              }
              .ticket-info {
                  margin-top: 20px;
                  padding: 10px;
                  border: 1px solid #ddd;
                  border-radius: 5px;
                  background-color: #f9f9f9;
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
              <h1>Ticket Purchase Confirmation</h1>
              <p>Dear ${ticketDetails.user.username},</p>
              <p>Thank you for purchasing a ticket with us! Here are the details of your ticket:</p>
              <div class="ticket-info">
              <img src="cid:qrcodecid" alt="QR Code" style="max-width: 200px; height: auto; margin: 0 auto;"/>
                  <p><strong>Bus:</strong> ${ticketDetails.ride.name}</p>
                  <p><strong>Departure Time:</strong> ${ticketDetails.ride.schedule}</p>
                  <p><strong>From:</strong> ${ticketDetails.ride.route.from}</p>
                  <p><strong>To:</strong> ${ticketDetails.ride.route.to}</p>
                  <p><strong>Seats Booked:</strong> ${ticketDetails.seatsBooked}</p>
                  <p><strong>Total Price:</strong> ${ticketDetails.totalPrice}</p>
              </div>
              <p>If you have any questions, feel free to contact our support team.</p>
              <div class="footer">
                  <p>Best regards,</p>
                  <p>Your Tickets Booking</p>
              </div>
          </div>
      </body>
      </html>
    `;

  return ticketTemplate;
};

module.exports = sendTicketConfirmationEmail;
