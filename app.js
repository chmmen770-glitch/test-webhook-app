// Import Express
const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

// ENV VARIABLES
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// 1) VERIFY WEBHOOK (GET)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK VERIFIED");
    return res.status(200).send(challenge);
  }

  console.log("Webhook verification failed!");
  return res.sendStatus(403);
});

// 2) RECEIVE MESSAGES (POST)
app.post("/webhook", async (req, res) => {
  console.log("📩 Webhook received:");
  console.log(JSON.stringify(req.body, null, 2));

  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const messages = changes?.value?.messages;

    if (messages && messages.length > 0) {
      const msg = messages[0];
      const from = msg.from;            // מספר המשתמש
      const text = msg.text?.body;      // הטקסט שהמשתמש שלח

      console.log("📨 User said:", text);

      // SEND A REPLY BACK VIA CLOUD API
      await fetch(
        `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ACCESS_TOKEN}`,
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: from,
            type: "text",
            text: { body: `You said: ${text}` },
          }),
        }
      );

      console.log("✔ Reply sent successfully!");
    }
  } catch (e) {
    console.error("❌ Error handling webhook:", e);
  }

  res.sendStatus(200);
});

// 3) ROOT ENDPOINT (just to check server status)
app.get("/", (req, res) => {
  res.send("Webhook server is running!");
});

// START SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server running on port", port);
});
