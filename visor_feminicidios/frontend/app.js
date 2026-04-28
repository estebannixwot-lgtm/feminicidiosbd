document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar Mapa
    const map = L.map('map').setView([4.5709, -74.2973], 6); // Centro de Colombia

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    try {
        // Fetch datos del backend
        const response = await fetch('http://localhost:3000/api/statistics');
        const data = await response.json();

        // Actualizar UI
        const total2025 = data.nacionales.find(n => n.anio === 2025)?.total_feminicidios || 621;
        document.getElementById('total-nacional').textContent = total2025;

        // Renderizar Chart
        const ctx = document.getElementById('barChart').getContext('2d');
        
        // Top 5 departamentos
        const top5 = data.departamentos.slice(0, 5);
        const labels = top5.map(d => d.nombre);
        const values = top5.map(d => parseInt(d.total));

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Casos 2025',
                    data: values,
                    backgroundColor: 'rgba(225, 29, 72, 0.7)',
                    borderColor: 'rgba(225, 29, 72, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    }
                }
            }
        });

        // Coordenadas aproximadas para los departamentos del top 5
        const coords = {
            'Antioquia': [7.1995, -75.3412],
            'Bogotá D.C.': [4.6097, -74.0817],
            'Atlántico': [10.6966, -74.8741],
            'Valle del Cauca': [3.8009, -76.6231],
            'Magdalena': [10.2982, -74.1802],
            'Santander': [6.8373, -73.3444]
        };

        // Añadir marcadores al mapa
        data.departamentos.forEach(dep => {
            if (coords[dep.nombre]) {
                const radius = Math.sqrt(dep.total) * 3; // Tamaño proporcional
                L.circleMarker(coords[dep.nombre], {
                    radius: radius,
                    fillColor: "#e11d48",
                    color: "#fff",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.6
                }).addTo(map)
                .bindPopup(`<b>${dep.nombre}</b><br>Feminicidios: ${dep.total}`);
            }
        });

    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('total-nacional').textContent = "Error";
    }
});
