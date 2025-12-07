import express from "express";
import fetch from "node-fetch"; // צריך להתקין: npm install node-fetch

const app = express();
app.use(express.json());

// ----------------- CONFIG -----------------
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "mysecrettoken";
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || "<EAAcExzDCsnABQIH549AdcVWnDFRGzqZC7EEsIEKUe4TLM1wjLVHT4IwXRc8788IyBFbyblw8MegwtrCzYJZAAmXlLv66YsUjeUZAO6X6QZAZCcbocCPiHxBf7imedZBa2JZALw91F2n6lMr9miDMD5okYhPb6kCF9tZBN9bjMwH41O8ZCm3jTZAyVp1Rruds9CzplRQJIAtVZATXCCwZCUWzUWW0PJtWbTl72ZAqZAEJ6bkibCq9CnZCyNne8HEAH0Y6RmliKlSnGCluogM17GVsFNSJeGf>";
const PHONE_ID = process.env.PHONE_ID || "<963082496878613>";

// ---------- GET /webhook  (Verification) ----------
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("Meta GET verification received:", req.query);

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified successfully!");
    return res.status(200).send(challenge);
  }

  console.log("Webhook verification failed!");
  return res.sendStatus(403);
});

// ---------- POST /webhook  (Messages from WhatsApp) ----------
app.post("/webhook", async (req, res) => {
  console.log("Incoming webhook POST:", JSON.stringify(req.body, null, 2));

  const messages = req.body.entry?.[0]?.changes?.[0]?.value?.messages || [];

  for (let message of messages) {
    const phoneNumber = message.from;

    const body = {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "text",
      text: { body: "Hello from Webhook!" } // כאן ההודעה האוטומטית
    };

    try {
      await fetch(`https://graph.facebook.com/v22.0/${PHONE_ID}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      console.log("Message sent to", phoneNumber);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  res.sendStatus(200);
});

// Root endpoint just to show it's alive
app.get("/", (req, res) => {
  res.send("Webhook server is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

