const express = require("express");
const router = express.Router();
const SensorData = require("../models/SensorData");

// Routes
router.get("/", (req, res) => {
  SensorData.find((err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json(data);
  });
});

router.post("/createData", (req, res) => {
  const data = req.body;

  const newSensorData = new SensorData(data);

  newSensorData.save((error) => {
    if (error) {
      res.status(500).json({ msg: "Sorry, internal server errors" });
      return;
    }
    // SensorData
    return res.json({
      msg: "Your data has been saved!!!!!!",
    });
  });
});

router.delete("/deleteData", (req, res) => {
  const { id } = req.body;
  SensorData.findByIdAndRemove(id, (err) => {
    if (err) return res.send(err);
    return res.json({ success: true });
  });
});

router.post("/updateData", (req, res) => {
  const { id, update } = req.body;
  SensorData.findByIdAndUpdate(id, update, (err) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

module.exports = router;
