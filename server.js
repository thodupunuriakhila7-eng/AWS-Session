// -------------------- Core Imports --------------------
const express = require("express");
const path = require("path");
require("dotenv").config();

// -------------------- App Init --------------------
const app = express();
const PORT = process.env.PORT || 3000;

// -------------------- Env Validation --------------------
const REQUIRED_ENVS = ["SECRET_KEY", "STATIC_DIR", "DOMAIN"];

REQUIRED_ENVS.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required env variable: ${key}`);
    process.exit(1);
  }
});

// -------------------- Stripe Init --------------------
const stripe = require("stripe")(process.env.SECRET_KEY);

// -------------------- Middleware --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files
const staticPath = path.resolve(__dirname, process.env.STATIC_DIR);
app.use(express.static(staticPath));

// -------------------- Routes --------------------

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.resolve(staticPath, "index.html"));
});

// Success page
app.get("/success", (req, res) => {
  res.sendFile(path.resolve(staticPath, "success.html"));
});

// Cancel page
app.get("/cancel", (req, res) => {
  res.sendFile(path.resolve(staticPath, "cancel.html"));
});

// Workshop pages
app.get("/workshop1", (req, res) => {
  res.sendFile(path.resolve(staticPath, "workshops", "workshop1.html"));
});

app.get("/workshop2", (req, res) => {
  res.sendFile(path.resolve(staticPath, "workshops", "workshop2.html"));
});

app.get("/workshop3", (req, res) => {
  res.sendFile(path.resolve(staticPath, "workshops", "workshop3.html"));
});

// -------------------- Stripe Checkout --------------------
app.post("/create-checkout-session/:pid", async (req, res) => {
  try {
    const priceId = req.params.pid;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.DOMAIN}/success?id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.DOMAIN}/cancel`,
      allow_promotion_codes: true,
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error("❌ Stripe Error:", err.message);
    res.status(500).json({ error: "Payment session creation failed" });
  }
});

// -------------------- Server Start --------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 App URL: ${process.env.DOMAIN}`);
});
