const express = require('express');
const router = express.Router();
const SensorData = require('../models/SensorData');


// Routes
router.get("/", (req, res) => {
    SensorData.find((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json(data);
    });
  });

router.post('/createData', (req, res) => {
    const data = req.body;

    const newSensorData = new SensorData(data);

    newSensorData.save((error) => {
        if (error) {
            res.status(500).json({ msg: 'Sorry, internal server errors' });
            return;
        }
        // SensorData
        return res.json({
            msg: 'Your data has been saved!!!!!!'
        });
    });
});



module.exports = router;