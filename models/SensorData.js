const mongoose = require('mongoose');


// Schema
const Schema = mongoose.Schema;
const OpenSensorData = new Schema({
    title: String,
    body: String,
    name: String,
    date: {
        type: String,
        default: Date.now()
    }
});

// Model
const SensorData = mongoose.model('SensorData', OpenSensorData);

module.exports =  SensorData;