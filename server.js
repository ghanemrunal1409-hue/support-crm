const express = require("express");
const cors = require("cors");

const ticketRoutes = require("./routes/ticketRoutes");

const app = express();

const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Ticket APIs
app.use("/api/tickets", ticketRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Support CRM API is running",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Support CRM API running on port ${PORT}`);
});