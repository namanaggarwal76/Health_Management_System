/**
 * Utility script to simulate vitals data updates for all occupied rooms
 * Run with: node utils/simulate-vitals.js
 */

const fs = require('fs');
const path = require('path');

// Get vitals data path
const vitalsPath = path.join(__dirname, '../data/vitals.json');
const roomsPath = path.join(__dirname, '../data/rooms.json');

// Function to get current room data
function getOccupiedRooms() {
  try {
    const roomsData = fs.readFileSync(roomsPath, 'utf8');
    const rooms = JSON.parse(roomsData);
    // Filter occupied rooms
    return rooms.filter(room => room.status === 'occupied');
  } catch (err) {
    console.error('Error reading rooms data:', err);
    return [];
  }
}

// Read the current vitals data
function getVitalsData() {
  try {
    const vitalsData = fs.readFileSync(vitalsPath, 'utf8');
    return JSON.parse(vitalsData);
  } catch (err) {
    console.error('Error parsing vitals JSON. Fixing...');
    // Try to fix by removing comments if any
    try {
      const cleanData = vitalsData.replace(/\/\/.*$/gm, '').trim();
      const vitals = JSON.parse(cleanData);
      // Save the fixed data
      fs.writeFileSync(vitalsPath, JSON.stringify(vitals, null, 2));
      console.log('Fixed and saved clean JSON data.');
      return vitals;
    } catch (fixErr) {
      console.error('Could not fix vitals data:', fixErr);
      return {};
    }
  }
}

// Generate random vital within range
function randomVital(base, variance) {
  return base + (Math.random() * variance * 2 - variance);
}

// Function to update vitals for a specific room
function updateVitalsForRoom(roomId) {
  let vitals = getVitalsData();
  
  if (!vitals[roomId]) {
    vitals[roomId] = {};
  }

  // Count existing entries for this room
  const entries = Object.keys(vitals[roomId]);
  const nextSeq = entries.length + 1;
  
  // If we have 5 entries already, rotate them
  if (entries.length >= 5) {
    for (let i = 1; i < 5; i++) {
      vitals[roomId][`${roomId}_${i}`] = vitals[roomId][`${roomId}_${i+1}`];
    }
    
    // Generate new values based on the latest values
    const latestKey = `${roomId}_5`;
    const latest = vitals[roomId][latestKey];
    
    const newVitals = {
      heartRate: Math.max(60, Math.min(100, randomVital(latest.heartRate, 2))),
      spo2: Math.max(92, Math.min(100, randomVital(latest.spo2, 1))),
      temperature: Math.max(36.0, Math.min(38.0, randomVital(latest.temperature, 0.1))),
      timestamp: new Date().toISOString()
    };
    
    vitals[roomId][latestKey] = newVitals;
  } else {
    // Add new entry
    const newVitals = {
      heartRate: randomVital(75, 5),
      spo2: randomVital(97, 2),
      temperature: randomVital(36.8, 0.3),
      timestamp: new Date().toISOString()
    };
    
    vitals[roomId][`${roomId}_${nextSeq}`] = newVitals;
  }
  
  // Save updated data
  fs.writeFileSync(vitalsPath, JSON.stringify(vitals, null, 2));
  console.log(`Updated vitals for Room ${roomId} at ${new Date().toLocaleTimeString()}`);
}

// Function to update all occupied rooms
function updateAllOccupiedRooms() {
  // Get current occupied rooms (re-read every time to detect changes)
  const occupiedRooms = getOccupiedRooms();
  
  if (occupiedRooms.length === 0) {
    console.log('No occupied rooms found at this time.');
    return;
  }
  
  console.log(`Updating vitals for ${occupiedRooms.length} occupied rooms`);
  
  occupiedRooms.forEach(room => {
    updateVitalsForRoom(room.id.toString());
  });
  
  console.log(`Updated vitals for all rooms at ${new Date().toLocaleTimeString()}`);
}

// Update once immediately
updateAllOccupiedRooms();

// Then update every 5 seconds - run continuously without a timeout
const intervalId = setInterval(updateAllOccupiedRooms, 5000);

console.log('Simulation running continuously. Press Ctrl+C to stop.');

// Handle clean shutdown
process.on('SIGINT', () => {
  clearInterval(intervalId);
  console.log('Simulation stopped.');
  process.exit(0);
});
