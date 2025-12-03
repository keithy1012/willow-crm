require("dotenv").config({ path: ".env.test" });

jest.setTimeout(10000);

global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
};

const mongoose = require("mongoose");

async function setupTestDB() {
  if (!mongoose.connection.readyState) {
    await mongoose.connect(
      process.env.MONGO_URI_TEST || "mongodb://127.0.0.1:27017/test"
    );
  }
}

async function teardownTestDB() {
  await mongoose.disconnect();
}

async function clearDatabase() {
  const names = Object.keys(mongoose.connection.collections);
  for (const name of names)
    await mongoose.connection.collections[name].deleteMany({});
}

module.exports = { setupTestDB, teardownTestDB, clearDatabase };
