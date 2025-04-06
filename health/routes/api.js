const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Get room data from JSON file instead of OM2M
router.get('/room/:id', async (req, res) => {
  try {
    const vitalsPath = path.join(__dirname, '../data/vitals.json');
    const vitalsData = fs.readFileSync(vitalsPath, 'utf8');
    const vitals = JSON.parse(vitalsData);
    const roomData = vitals[req.params.id];
    
    if (!roomData) {
      return res.status(404).json({error: "Room data not found"});
    }
    
    res.json(roomData);
  } catch (error) {
    console.error('Error fetching room data:', error);
    res.status(500).json({error: "Failed to fetch data"});
  }
});

// Add an endpoint to update vital signs data
router.post('/room/:id', express.json(), (req, res) => {
  try {
    const roomId = req.params.id;
    const vitalsPath = path.join(__dirname, '../data/vitals.json');
    
    // Read existing data
    const vitalsData = fs.readFileSync(vitalsPath, 'utf8');
    const vitals = JSON.parse(vitalsData);
    
    // Update with new data
    vitals[roomId] = {
      ...req.body,
      timestamp: new Date().toISOString()
    };
    
    // Write back to file
    fs.writeFileSync(vitalsPath, JSON.stringify(vitals, null, 2));
    
    res.json({success: true});
  } catch (error) {
    console.error('Error updating room data:', error);
    res.status(500).json({error: "Failed to update data"});
  }
});

module.exports = router;