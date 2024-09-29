const sgMail = require("@sendgrid/mail");

// Set your SendGrid API Key
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Utility function to send an email
const sendEmail = async (to, subject, text, html) => {
  try {
    const msg = {
      to,
      from: "trian.v89@gmail.com",
      subject,
      text,
      html,
    };

    // Send the email using SendGrid's send method
    const response = await sgMail.send(msg);

    console.log("Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    if (error.response) {
      console.error(error.response.body);
    }
    throw error;
  }
};

module.exports = { sendEmail };
