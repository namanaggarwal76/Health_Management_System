document.addEventListener('DOMContentLoaded', function() {
    const roomId = window.location.pathname.split('/')[2];
    const heartRateEl = document.getElementById('heartRate');
    const spo2El = document.getElementById('spo2');
    const temperatureEl = document.getElementById('temperature');
    
    // Chart setup
    const ctx = document.getElementById('vitalChart').getContext('2d');
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          { label: 'Heart Rate', data: [], borderColor: 'red' },
          { label: 'SpO2', data: [], borderColor: 'blue' },
          { label: 'Temperature', data: [], borderColor: 'green' }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: false }
        }
      }
    });
    
    // Function to fetch and display vital signs data
    function fetchData() {
      fetch(`/api/room/${roomId}`)
        .then(response => response.json())
        .then(data => {
          // Update current vital sign display with the latest reading
          if (data.currentVitals) {
            heartRateEl.textContent = data.currentVitals.heartRate.toFixed(0);
            spo2El.textContent = data.currentVitals.spo2.toFixed(0);
            temperatureEl.textContent = data.currentVitals.temperature.toFixed(1);
          }
          
          // Clear existing chart data
          chart.data.labels = [];
          chart.data.datasets[0].data = [];
          chart.data.datasets[1].data = [];
          chart.data.datasets[2].data = [];
          
          // Update chart with all historical data
          if (data.historicalData && data.historicalData.length > 0) {
            data.historicalData.forEach(vital => {
              const time = new Date(vital.timestamp).toLocaleTimeString();
              chart.data.labels.push(time);
              chart.data.datasets[0].data.push(vital.heartRate);
              chart.data.datasets[1].data.push(vital.spo2);
              chart.data.datasets[2].data.push(vital.temperature);
            });
            chart.update();
          }
        })
        .catch(error => {
          console.error('Error fetching vital data:', error);
        });
    }
    
    // Fetch data every 2 seconds
    fetchData();
    setInterval(fetchData, 2000);
  });