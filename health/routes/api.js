const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Get room data from JSON file instead of OM2M
router.get('/room/:id', async (req, res) => {
  try {
    const vitalsPath = path.join(__dirname, '../data/vitals.json');
    console.log(`Reading vitals data from: ${vitalsPath}`);
    
    const vitalsData = fs.readFileSync(vitalsPath, 'utf8');
    
    // Make sure we can parse the JSON
    let vitals;
    try {
      vitals = JSON.parse(vitalsData);
    } catch (parseError) {
      console.error('Error parsing vitals JSON:', parseError);
      return res.status(500).json({
        error: "Invalid JSON in vitals data file",
        details: parseError.message
      });
    }
    
    const roomId = req.params.id;
    console.log(`Request for vitals in room: ${roomId}`);
    
    // If room doesn't exist in vitals
    if (!vitals[roomId]) {
      console.log(`No vitals data found for room ${roomId}`);
      return res.status(404).json({error: "Room data not found"});
    }
    
    // Get all vitals data for this room
    const roomVitals = vitals[roomId];
    console.log(`Found ${Object.keys(roomVitals).length} vitals entries for room ${roomId}`);
    
    const latestVitals = getLatestVitals(roomVitals);
    const historicalData = getAllVitalsOrdered(roomVitals);
    
    // Create response with all historical data
    const response = {
      currentVitals: latestVitals,
      historicalData: historicalData
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching room data:', error);
    res.status(500).json({error: "Failed to fetch data", details: error.message});
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
    
    // Initialize room if it doesn't exist
    if (!vitals[roomId]) {
      vitals[roomId] = {};
    }
    
    // Create new vitals data with timestamp
    const newVitalsData = {
      ...req.body,
      timestamp: new Date().toISOString()
    };
    
    // Handle the rotation of vitals data (maintain maximum 5 readings)
    rotateVitalsData(vitals[roomId], roomId, newVitalsData);
    
    // Write back to file
    fs.writeFileSync(vitalsPath, JSON.stringify(vitals, null, 2));
    
    res.json({success: true});
  } catch (error) {
    console.error('Error updating room data:', error);
    res.status(500).json({error: "Failed to update data"});
  }
});

// Helper function to get the latest vitals for a room
function getLatestVitals(roomVitals) {
  // Find the entry with the highest sequence number (e.g., roomId_5)
  const keys = Object.keys(roomVitals);
  if (keys.length === 0) return null;
  
  // Sort keys by the sequence number
  keys.sort((a, b) => {
    const seqA = parseInt(a.split('_')[1]);
    const seqB = parseInt(b.split('_')[1]);
    return seqB - seqA; // Descending order
  });
  
  console.log(`Latest vitals key: ${keys[0]}`);
  return roomVitals[keys[0]];
}

// Helper function to rotate vitals data, maintaining at most 5 entries
function rotateVitalsData(roomVitals, roomId, newData) {
  // Get all existing keys and their sequence numbers
  let entries = Object.keys(roomVitals).map(key => {
    const seqNum = parseInt(key.split('_')[1]);
    return { key, seqNum };
  });
  
  // Sort by sequence number (ascending)
  entries.sort((a, b) => a.seqNum - b.seqNum);
  
  // If we already have 5 entries, remove the oldest
  if (entries.length >= 5) {
    delete roomVitals[entries[0].key]; // Remove the oldest entry
    entries.shift(); // Remove from our array too
  }
  
  // Shift all remaining entries down by 1
  for (let i = 0; i < entries.length; i++) {
    const oldKey = entries[i].key;
    const newKey = `${roomId}_${i+1}`;
    
    if (oldKey !== newKey) {
      roomVitals[newKey] = roomVitals[oldKey];
      delete roomVitals[oldKey];
    }
  }
  
  // Add the new entry with the next sequence number
  const newSeqNum = entries.length + 1;
  roomVitals[`${roomId}_${newSeqNum}`] = newData;
}

// Helper function to get all vitals ordered by timestamp
function getAllVitalsOrdered(roomVitals) {
  const vitalsArray = Object.values(roomVitals);
  
  // Sort by timestamp (oldest first)
  vitalsArray.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  return vitalsArray;
}

module.exports = router;