const { MongoClient } = require("mongodb");
require("dotenv").config();

const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const getSeats = async (req, res) => {
  const client = await MongoClient(MONGO_URI, options);

  await client.connect();

  const db = client.db("flights");

  const seats = await db.collection("seats").find().toArray();
  res.status(200).json({ seats: seats });

  client.close();
};

module.exports = { getSeats };
