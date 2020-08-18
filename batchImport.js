const { MongoClient } = require("mongodb");
require("dotenv").config();

const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

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

const batchImport = async () => {
  try {
    const client = await MongoClient(MONGO_URI, options);
    await client.connect();

    const db = client.db("flights");
    generateSeats();

    await db.collection("seats").insertMany(Object.values(seats));
  } catch (err) {
    console.log(err);
  }

  client.close();
};

batchImport();
