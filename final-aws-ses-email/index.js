const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

// Get region from environment variables
const REGION = process.env.REGION;

// Build SES client
const sesClient = new SESClient({ region: REGION });

module.exports.handler = (event, context, callback) => {
  console.log("Received event:", JSON.stringify(event, null, 2));
  const { to, from, subject, body } = JSON.parse(event.body);

  if (!to || !from || !subject || !body) {
    const msg =
      "Missing fields: to=" +
      to +
      ", from=" +
      from +
      ", subject=" +
      subject +
      ", body=" +
      body;
    console.error(msg);

    return {
      statusCode: 400,
      body: JSON.stringify({
        message: msg,
        input: event,
      }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
      },
    };

    callback(new Error(msg), resp);
  }

  // Build SES client

  const params = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: subject,
      },
      Body: {
        Text: {
          Data: body,
        },
      },
    },
    Source: from,
  };

  console.info(
    "Building email request for SES: " + JSON.stringify(params, null, 2)
  );

  const sesCommand = new SendEmailCommand(params);

  // Use client to send email
  sesClient.send(sesCommand, (error, data) => {
    console.info(
      "Sent email request to SES: data=" +
        JSON.stringify(data, null, 2) +
        ", error=" +
        JSON.stringify(error, null, 2)
    );

    if (error) {
      console.error("Error sending email: " + JSON.stringify(error, null, 2));
      response = {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error sending email",
          error: error,
        }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "*",
        },
      };
      callback(new Error(error), response);
    }

    // Check status from SES and return 200 if successful
    console.log("Email sent successfully +" + JSON.stringify(data));
    response = {
      statusCode: 200,
      body: JSON.stringify({
        message: "Email sent",
      }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
      },
    };
    callback(null, response);
  });
};
