const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db"); // Database connection file
const vesselRoutes = require("./routes/vesselRoutes");
const delayRoutes = require("./routes/delay");
const portToPlantRoutes = require("./routes/portToPlantRoutes"); // New route

dotenv.config();

const app = express();

console.log("Gemini Key Loaded:", process.env.GEMINI_API_KEY ? "Yes ✅" : "No ❌");

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Default route
app.get("/", (req, res) => {
  res.json({
    message: "API is running 🚀",
    endpoints: {
      vessel: {
        create: "POST /api/vessels",
        getAll: "GET /api/vessels",
        getById: "GET /api/vessels/:id",
        predictDelay: "POST /api/vessels/:id/predict-delay",
        update: "PUT /api/vessels/:id",
        delete: "DELETE /api/vessels/:id",
        getByPort: "GET /api/vessels/port/:portName",
        getBySupplier: "GET /api/vessels/supplier/:supplierName",
        getStats: "GET /api/vessels/stats"
      },
      delay: {
        predictDelay: "POST /api/delay/predict"
      },
      portToPlant: {
        getAnalysis: "GET /api/port-to-plant/vessel/:vesselId",
        regenerateAnalysis: "POST /api/port-to-plant/vessel/:vesselId/regenerate",
        getAllAnalyses: "GET /api/port-to-plant/"
      }
    }
  });
});

// 👉 Mount the routes
app.use('/api/vessels', vesselRoutes);
app.use('/api/delay', delayRoutes);
app.use('/api/port-to-plant', portToPlantRoutes); // New route mounting

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});