import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const { MAIL_HOST, MAIL_USER, MAIL_PASS, MAIL_PORT } = process.env;

export const mailSender = async (email, title, body) => {
  try {
    // transporter to send emails
    let transporter = nodemailer.createTransport({
      host: MAIL_HOST,
      port: MAIL_PORT,
      secure: true,
      auth: {
        user: MAIL_USER,
        pass: MAIL_PASS,
      },
    });
    // Send emails to users
    const info = await transporter.sendMail({
      from: "leasy.subletting@gmail.com",
      to: email,
      subject: title,
      html: generateEmail(title, body),
    });
    console.log("Email info: ", info);
    return info;
  } catch (error) {
    console.log(error.message);
  }
};

const emailTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leasy</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #7C3AED;
            color: white;
            padding: 20px;
            text-align: center;
        }
        .content {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 5px;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 0.8em;
            color: #666;
        }
        h3 {
            color: #a855f7;
            font-weight: 700;
        }
        .btn {
            display: inline-block;
            background-color: #7C3AED;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 15px;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Leasy</h1>
        <p>Subletting made easy</p>
    </div>

    <div class="content">
        <h3>{{subject}}</h3>
        {{content}}
    </div>

    <div class="footer">
        <p>&copy; 2024 Leasy. All rights reserved.</p>
        <p>If you have any questions, please contact us at leasy@gmail.com</p>
    </div>
</body>
</html>`;

function generateEmail(subject, content) {
  return emailTemplate
    .replace("{{subject}}", subject)
    .replace("{{content}}", content);
}
