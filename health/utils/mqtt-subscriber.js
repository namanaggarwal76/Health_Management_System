const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');

// MQTT Configuration
const brokerUrl = 'mqtt://test.mosquitto.org';
const client = mqtt.connect(brokerUrl);

// File paths
const vitalsPath = path.join(__dirname, '../data/vitals.json');

// Load existing vitals data
let vitalsData = {};
try {
    vitalsData = JSON.parse(fs.readFileSync(vitalsPath, 'utf8'));
    console.log('✅ Successfully loaded existing vitals data');
} catch (error) {
    console.error('Error reading vitals.json:', error);
    process.exit(1);
}

// MQTT Connection handler
client.on('connect', () => {
    console.log(`✅ Connected to MQTT broker at ${brokerUrl}`);
    
    // Subscribe to all 30 topics (10 patients × 3 vitals)
    for (let i = 1; i <= 30; i++) {
        const topic = `/test/esp32/data${i}`;
        client.subscribe(topic, (err) => {
            if (err) {
                console.error(`❌ Error subscribing to ${topic}:`, err);
            } else {
                console.log(`✅ Successfully subscribed to ${topic}`);
            }
        });
    }
});

// MQTT Message handler
client.on('message', (topic, message) => {
    console.log(`📩 Received message on topic ${topic}: ${message.toString()}`);
    
    try {
        const fieldIndex = parseInt(topic.split('data')[1]);
        const value = parseFloat(message.toString());
        
        if (isNaN(fieldIndex) || isNaN(value)) {
            console.error(`❌ Invalid message format: topic=${topic}, message=${message.toString()}`);
            return;
        }
        
        // Calculate patient number and vital type based on field index
        const patientNumber = Math.floor((fieldIndex - 1) / 3) + 1;
        const vitalType = (fieldIndex - 1) % 3 === 0 ? 'temp' : ((fieldIndex - 1) % 3 === 1 ? 'spo2' : 'heartRate');

        console.log(`📊 Processing update for patient ${patientNumber} ${vitalType} with value ${value}`);
        updateVitalsData(patientNumber, vitalType, value);
        saveVitalsData();
    } catch (error) {
        console.error('❌ Error processing message:', error);
    }
});

// Connection error handler
client.on('error', (error) => {
    console.error('❌ MQTT Connection Error:', error);
});

// Reconnect handler
client.on('reconnect', () => {
    console.log('🔄 Attempting to reconnect to MQTT broker...');
});

// Close handler
client.on('close', () => {
    console.log('🔌 Connection to MQTT broker closed');
});

function updateVitalsData(patientNumber, vitalType, value) {
    const patientKey = String(patientNumber);

    // Ensure patient and vital objects exist
    if (!vitalsData[patientKey]) {
        vitalsData[patientKey] = {
            temp: { "1": null, "2": null, "3": null, "4": null, "5": null },
            spo2: { "1": null, "2": null, "3": null, "4": null, "5": null },
            heartRate: { "1": null, "2": null, "3": null, "4": null, "5": null }
        };
        console.log(`📝 Initialized new patient ${patientNumber} with null values`);
    }

    // If this is the first update for this patient, initialize all previous values as null
    if (vitalsData[patientKey][vitalType]["1"] === undefined) {
        vitalsData[patientKey][vitalType] = { "1": null, "2": null, "3": null, "4": null, "5": null };
        console.log(`📝 Initialized ${vitalType} for patient ${patientNumber} with null values`);
    }

    // Shift older readings down
    for (let i = 1; i < 5; i++) {
        vitalsData[patientKey][vitalType][i] = vitalsData[patientKey][vitalType][(i + 1)];
    }

    // Set the newest reading at "5"
    vitalsData[patientKey][vitalType]["5"] = value;
}

function saveVitalsData() {
    try {
        fs.writeFileSync(vitalsPath, JSON.stringify(vitalsData, null, 2));
        console.log('💾 Vitals data saved successfully');
    } catch (error) {
        console.error('❌ Error saving vitals data:', error);
    }
}

process.on('SIGINT', () => {
    console.log('👋 Disconnecting from MQTT broker...');
    client.end();
    process.exit();
}); 