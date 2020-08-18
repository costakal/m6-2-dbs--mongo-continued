const router = require("express").Router();
const { MongoClient } = require("mongodb");
require("dotenv").config();
const { getSeats } = require("./handlers");

const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// ----------------------------------
//////// HELPERS
const getRowName = (rowIndex) => {
  return String.fromCharCode(65 + rowIndex);
};

let state;

router.get("/api/seat-availability", getSeats);

let lastBookingAttemptSucceeded = false;

router.post("/api/book-seat", async (req, res) => {
  const { seatId, creditCard, expiration } = req.body;

  const isAlreadyBooked = state.seats[seatId].isBooked;
  if (isAlreadyBooked) {
    return res.status(400).json({
      message: "This seat has already been booked!",
    });
  }

  if (!creditCard || !expiration) {
    return res.status(400).json({
      status: 400,
      message: "Please provide credit card information!",
    });
  }

  if (lastBookingAttemptSucceeded) {
    lastBookingAttemptSucceeded = !lastBookingAttemptSucceeded;

    return res.status(500).json({
      message: "An unknown error has occurred. Please try your request again.",
    });
  }

  lastBookingAttemptSucceeded = !lastBookingAttemptSucceeded;

  // to do connect to mongo to change specific seat from false to true
  state.bookedSeats[seatId] = true;

  return res.status(200).json({
    status: 200,
    success: true,
  });
});

module.exports = router;
