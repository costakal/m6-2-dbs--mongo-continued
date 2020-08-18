const router = require("express").Router();

const { getSeats, updateSeat } = require("./handlers");

router.get("/api/seat-availability", getSeats);

router.post("/api/book-seat", updateSeat);

module.exports = router;
