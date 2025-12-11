require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const initRoutes = require("./routes");
const { firebaseConnect } = require("./config/firebase");

const app = express();
const PORT = process.env.PORT || 8888;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Kết nối Firebase
firebaseConnect();

// Setup routes
initRoutes(app);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});