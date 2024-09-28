const sgMail = require("@sendgrid/mail");

// Set your SendGrid API Key (usually from environment variable)
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Utility function to send an email
const sendEmail = async (to, subject, text, html) => {
  try {
    const msg = {
      to, // Recipient email
      from: "trian.v89@gmail.com", // Your verified SendGrid sender email
      subject, // Email subject
      text, // Plain text version of the email
      html, // HTML version of the email
    };

    // Send the email using SendGrid's send method
    const response = await sgMail.send(msg);

    console.log("Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    if (error.response) {
      console.error(error.response.body); // Detailed error response from SendGrid
    }
    throw error;
  }
};

module.exports = { sendEmail };
