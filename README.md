# Hospital Monitoring System

This is an IoT-based hospital monitoring system that tracks patient data, room statuses, and vital signs in real-time.

## Features
- Add, update, and discharge patients.
- Monitor real-time vital signs (Heart Rate, SpO2, Temperature).
- View activity logs for patient actions.
- Dashboard with room statuses.

## Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/)

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/namanaggarwal76/Health_Management_System.git
   cd health
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Development
To start the server in development mode with live reload:
```bash
npm run dev
```

## Vital Signs Simulation
To simulate real-time vital signs for testing:
```bash
node utils/simulate-vitals.js
```

This script generates realistic vital sign data (heart rate, SpO2, temperature) for all occupied rooms every 5 seconds. The simulation runs continuously until stopped with Ctrl+C.

## Project Structure
```
hospital_monitoring/
├── views/          # Nunjucks templates
├── public/         # Static assets (CSS, JS, images)
├── routes/         # Express routes
├── data/           # JSON files for mock data
├── server.js       # Main server file
├── package.json    # Project metadata and dependencies
```

## License
This project is licensed under the MIT License.
