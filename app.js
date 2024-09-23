// Getting our packages that are necessary
const express = require("express");
const mongoose = require("mongoose");
var morgan = require("morgan");
var cors = require("cors");

// Imports for the routing and errorHandling
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");

const meetingRouter = require("./routes/meetingRoute");

// Initializing our app and setting up logging
const app = express();
app.use(morgan("dev"));
const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Middlewares
app.use(express.json());
// Routers for routing the urls inside app
app.use("/api/v1/meetings/", meetingRouter);

// 404 Middleware
app.all("*", (req, res, next) => {
  next(
    new AppError(
      `can't find the ${req.originalUrl} on the server`,
      404,
      "E0001"
    )
  );
});

// Error Middleware
app.use(globalErrorHandler);

module.exports = app;
