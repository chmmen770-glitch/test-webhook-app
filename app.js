import express from "express";

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "mysecrettoken";

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
app.post("/webhook", (req, res) => {
  console.log("Incoming webhook POST:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

// Root endpoint just to show it's alive
app.get("/", (req, res) => {
  res.send("Webhook server is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
