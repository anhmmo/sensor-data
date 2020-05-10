const mongoose = require("mongoose");

// Schema
const Schema = mongoose.Schema;
const OpenSensorData = new Schema(
  {
    date: String,
    sensor1: String,
    sensor2: String,
    sensor3: String,
    sensor4: String,
  },
  { timestamps: true }
);

// Model
const SensorData = mongoose.model("SensorData", OpenSensorData);

module.exports = SensorData;
