const express = require("express");
const cors = require("cors");

const ticketRoutes = require("./routes/ticketRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// =====================================================
// MIDDLEWARE
// =====================================================
app.use(cors());
app.use(express.json());

// =====================================================
// TICKET ROUTES
// =====================================================
app.use("/api/tickets", ticketRoutes);

// =====================================================
// HEALTH CHECK
// =====================================================
app.get("/", (req, res) => {
  res.json({
    message: "Support CRM API is running",
  });
});

// =====================================================
// START SERVER
// =====================================================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Support CRM API running on port ${PORT}`);
});