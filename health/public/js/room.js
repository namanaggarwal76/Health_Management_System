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
    
    // WebSocket or polling for real-time data
    function fetchData() {
      fetch(`/api/room/${roomId}`)
        .then(response => response.json())
        .then(data => {
          heartRateEl.textContent = data.heartRate.toFixed(0);
          spo2El.textContent = data.spo2.toFixed(0);
          temperatureEl.textContent = data.temperature.toFixed(1);
          
          // Update chart
          const time = new Date(data.timestamp).toLocaleTimeString();
          chart.data.labels.push(time);
          if (chart.data.labels.length > 15) {
            chart.data.labels.shift();
            chart.data.datasets.forEach(dataset => dataset.data.shift());
          }
          
          chart.data.datasets[0].data.push(data.heartRate);
          chart.data.datasets[1].data.push(data.spo2);
          chart.data.datasets[2].data.push(data.temperature);
          chart.update();
        });
    }
    
    // Fetch data every 2 seconds
    fetchData();
    setInterval(fetchData, 2000);
  });