document.addEventListener('DOMContentLoaded', function() {
    const roomId = window.location.pathname.split('/')[2];
    const heartRateEl = document.getElementById('heartRate');
    const spo2El = document.getElementById('spo2');
    const temperatureEl = document.getElementById('temperature');
    
    // Check if Chart is available
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded! Please check your script includes.');
        return;
    }
    
    // Chart setup for heart rate
    const heartRateCtx = document.getElementById('heartRateChart').getContext('2d');
    const heartRateChart = new Chart(heartRateCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          { 
            label: 'Heart Rate', 
            data: [], 
            borderColor: 'red',
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            tension: 0.1,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: { 
            beginAtZero: false,
            title: {
              display: true,
              text: 'BPM'
            }
          }
        },
        animation: {
          duration: 500
        }
      }
    });
    
    // Chart setup for SpO2
    const spo2Ctx = document.getElementById('spo2Chart').getContext('2d');
    const spo2Chart = new Chart(spo2Ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          { 
            label: 'SpO2', 
            data: [], 
            borderColor: 'blue',
            backgroundColor: 'rgba(0, 0, 255, 0.1)',
            tension: 0.1,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: { 
            beginAtZero: false,
            min: 90,
            max: 100,
            title: {
              display: true,
              text: '%'
            }
          }
        },
        animation: {
          duration: 500
        }
      }
    });
    
    // Chart setup for temperature
    const tempCtx = document.getElementById('temperatureChart').getContext('2d');
    const tempChart = new Chart(tempCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          { 
            label: 'Temperature', 
            data: [], 
            borderColor: 'green',
            backgroundColor: 'rgba(0, 128, 0, 0.1)',
            tension: 0.1,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: { 
            beginAtZero: false,
            title: {
              display: true,
              text: '°C'
            }
          }
        },
        animation: {
          duration: 500
        }
      }
    });
    
    // Function to fetch and display vital signs data
    function fetchData() {
      console.log(`Fetching data for room ${roomId}...`);
      
      fetch(`/api/room/${roomId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Received vital data:', data);
          
          // Update current vital sign display with the latest reading
          if (data.currentVitals) {
            heartRateEl.textContent = data.currentVitals.heartRate.toFixed(0);
            spo2El.textContent = data.currentVitals.spo2.toFixed(0);
            temperatureEl.textContent = data.currentVitals.temperature.toFixed(1);
            
            // Add visual indicator for updates
            heartRateEl.classList.add('updated');
            spo2El.classList.add('updated');
            temperatureEl.classList.add('updated');
            
            setTimeout(() => {
              heartRateEl.classList.remove('updated');
              spo2El.classList.remove('updated');
              temperatureEl.classList.remove('updated');
            }, 500);
          } else {
            console.warn('No current vitals data received');
          }
          
          // Clear existing chart data
          heartRateChart.data.labels = [];
          heartRateChart.data.datasets[0].data = [];
          
          spo2Chart.data.labels = [];
          spo2Chart.data.datasets[0].data = [];
          
          tempChart.data.labels = [];
          tempChart.data.datasets[0].data = [];
          
          // Update charts with historical data
          if (data.historicalData && data.historicalData.length > 0) {
            data.historicalData.forEach(vital => {
              const time = new Date(vital.timestamp).toLocaleTimeString();
              
              // Update Heart Rate chart
              heartRateChart.data.labels.push(time);
              heartRateChart.data.datasets[0].data.push(vital.heartRate);
              
              // Update SpO2 chart
              spo2Chart.data.labels.push(time);
              spo2Chart.data.datasets[0].data.push(vital.spo2);
              
              // Update Temperature chart
              tempChart.data.labels.push(time);
              tempChart.data.datasets[0].data.push(vital.temperature);
            });
            
            heartRateChart.update();
            spo2Chart.update();
            tempChart.update();
          } else {
            console.warn('No historical data available for the charts');
          }
        })
        .catch(error => {
          console.error('Error fetching vital data:', error);
          heartRateEl.textContent = '--';
          spo2El.textContent = '--';
          temperatureEl.textContent = '--';
        });
    }
    
    // Fetch data every 5 seconds
    fetchData();
    setInterval(fetchData, 5000);
});