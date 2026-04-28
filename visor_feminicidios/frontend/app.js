let map;
let chartInstance;
let markerGroup;

// Coordenadas aproximadas para los departamentos
const coords = {
    'Antioquia': [7.1995, -75.3412],
    'Bogotá D.C.': [4.6097, -74.0817],
    'Atlántico': [10.6966, -74.8741],
    'Valle del Cauca': [3.8009, -76.6231],
    'Magdalena': [10.2982, -74.1802],
    'Santander': [6.8373, -73.3444]
};

// Coordenadas para municipios
const cityCoords = {
    'Medellín': [6.2442, -75.5812],
    'Bello': [6.3373, -75.5580],
    'Itagüí': [6.1738, -75.6033],
    'Envigado': [6.1759, -75.5917],
    'Bogotá D.C.': [4.6097, -74.0817],
    'Barranquilla': [10.9685, -74.7813],
    'Soledad': [10.9184, -74.7646],
    'Malambo': [10.8582, -74.7709],
    'Cali': [3.4516, -76.5320],
    'Buenaventura': [3.8801, -77.0312],
    'Palmira': [3.5394, -76.3036],
    'Tuluá': [4.0847, -76.1954],
    'Santa Marta': [11.2408, -74.1990],
    'Ciénaga': [11.0061, -74.2505],
    'Fundación': [10.5186, -74.1852]
};

document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar Mapa
    map = L.map('map').setView([4.5709, -74.2973], 6); // Centro de Colombia
    markerGroup = L.layerGroup().addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap & CARTO',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    await loadNationalData();

    document.getElementById('dept-select').addEventListener('change', handleFilterChange);
    document.getElementById('year-select').addEventListener('change', handleFilterChange);
});

async function handleFilterChange() {
    const deptSelect = document.getElementById('dept-select');
    const deCodigo = deptSelect.value;
    const deName = deptSelect.options[deptSelect.selectedIndex].text;
    const year = document.getElementById('year-select').value;

    if (deCodigo) {
        await loadDepartmentData(deCodigo, deName, year);
    } else {
        await loadNationalData(year);
    }
}

async function loadNationalData(year = 2025) {
    markerGroup.clearLayers();
    map.setView([4.5709, -74.2973], 6);

    try {
        const response = await fetch(`http://localhost:3000/api/statistics?year=${year}`);
        const data = await response.json();

        // Populate departments select if it's empty
        const deptSelect = document.getElementById('dept-select');
        if (deptSelect.options.length <= 1) {
            data.departamentos.forEach(dep => {
                const opt = document.createElement('option');
                opt.value = dep.codigo;
                opt.textContent = dep.nombre;
                deptSelect.appendChild(opt);
            });
        }

        let currentTotal = 0;
        data.departamentos.forEach(d => currentTotal += parseInt(d.total));
        document.getElementById('total-nacional').textContent = currentTotal;

        const top5 = data.departamentos.slice(0, 5);
        updateChart('Departamentos con más Casos', top5.map(d => d.nombre), top5.map(d => parseInt(d.total)));

        data.departamentos.forEach(dep => {
            const total = parseInt(dep.total);
            if (total > 0 && coords[dep.nombre]) {
                const radius = Math.sqrt(total) * 3;
                L.circleMarker(coords[dep.nombre], {
                    radius: radius > 5 ? radius : 5,
                    fillColor: "#e11d48",
                    color: "#fff",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.6
                }).addTo(markerGroup)
                .bindPopup(`<b>${dep.nombre}</b><br>Feminicidios: ${total}`);
            }
        });
    } catch (error) {
        console.error(error);
    }
}

async function loadDepartmentData(deCodigo, deName, year = 2025) {
    markerGroup.clearLayers();
    if (coords[deName]) {
        map.setView(coords[deName], 9);
    }

    try {
        const response = await fetch(`http://localhost:3000/api/municipios/${deCodigo}?year=${year}`);
        const cities = await response.json();

        let deptTotal = 0;
        cities.forEach(c => deptTotal += parseInt(c.total_casos));
        document.getElementById('total-nacional').textContent = deptTotal;

        updateChart(`Municipios en ${deName}`, cities.map(c => c.nombre), cities.map(c => parseInt(c.total_casos)));

        cities.forEach(city => {
            const total = parseInt(city.total_casos);
            if (total > 0 && cityCoords[city.nombre]) {
                const radius = Math.sqrt(total) * 5; 
                L.circleMarker(cityCoords[city.nombre], {
                    radius: radius > 5 ? radius : 5,
                    fillColor: "#9333ea", 
                    color: "#fff",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.6
                }).addTo(markerGroup)
                .bindPopup(`<b>${city.nombre}</b><br>Casos registrados: ${total}`);
            }
        });
    } catch (error) {
        console.error(error);
    }
}

function updateChart(label, labels, data) {
    const ctx = document.getElementById('barChart').getContext('2d');
    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
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
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#94a3b8' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
}
