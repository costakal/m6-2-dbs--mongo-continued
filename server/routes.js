const router = require("express").Router();
const { MongoClient } = require("mongodb");
require("dotenv").config();

const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const NUM_OF_ROWS = 8;
const SEATS_PER_ROW = 12;

// Code that is generating the seats.
// ----------------------------------
const seats = {};

const generateSeats = () => {
  const row = ["A", "B", "C", "D", "E", "F", "G", "H"];
  for (let r = 0; r < row.length; r++) {
    for (let s = 1; s < 13; s++) {
      seats[`${row[r]}-${s}`] = {
        _id: `${row[r]}-${s}`,
        price: 225,
        isBooked: false,
      };
    }
  }
};
// ----------------------------------
//////// HELPERS
const getRowName = (rowIndex) => {
  return String.fromCharCode(65 + rowIndex);
};

let state;

router.get("/api/seat-availability", async (req, res) => {
  const databaseSetup = async () => {
    const client = await MongoClient(MONGO_URI, options);
    await client.connect();
    console.log("connected");

    const db = client.db("flights");
    const dbSeats = db.collection("seats");

    const dbSeatsArray = await dbSeats.find().toArray();

    if (dbSeatsArray.length === 0) {
      console.log("initial setup");
      generateSeats();
      await dbSeats.insertMany(Object.values(seats));
    } else {
      dbSeatsArray.map((seat) => {
        seats[seat._id] = seat;
      });
    }

    client.close();
    console.log("closing");
  };

  await databaseSetup();
  console.log("List of Seats: ", seats);

  return res.json({
    seats: seats,
    numOfRows: 8,
    seatsPerRow: 12,
  });
});

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
