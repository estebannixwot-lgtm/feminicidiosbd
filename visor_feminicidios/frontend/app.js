let map;
let chartInstance;
let markerGroup;
let geojsonLayer;
let currentStats = [];

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

// Obtener color basado en total de casos
function getColor(d) {
    return d > 80 ? '#800026' :
           d > 50  ? '#BD0026' :
           d > 30  ? '#E31A1C' :
           d > 20  ? '#FC4E2A' :
           d > 10   ? '#FD8D3C' :
           d > 0   ? '#FEB24C' :
                     'rgba(255,255,255,0.05)';
}

function stylePolygon(feature) {
    // Normalizar nombre para coincidir
    const name = feature.properties.NOMBRE_DPT;
    const stat = currentStats.find(s => s.nombre.toUpperCase() === name.toUpperCase() || (name === 'SANTAFE DE BOGOTA D.C' && s.nombre === 'Bogotá D.C.'));
    const total = stat ? parseInt(stat.total) : 0;
    
    return {
        fillColor: getColor(total),
        weight: 1,
        opacity: 1,
        color: '#475569',
        fillOpacity: total > 0 ? 0.7 : 0.2
    };
}

document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar Mapa
    map = L.map('map').setView([4.5709, -74.2973], 6); // Centro de Colombia
    markerGroup = L.layerGroup().addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
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
    if (geojsonLayer) map.removeLayer(geojsonLayer);
    map.setView([4.5709, -74.2973], 6);

    try {
        const response = await fetch(`http://localhost:3000/api/statistics?year=${year}`);
        const data = await response.json();
        currentStats = data.departamentos;

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
        updateChart(`Top 5 Deptos (${year})`, top5.map(d => d.nombre), top5.map(d => parseInt(d.total)));

        // Cargar GeoJSON de Colombia
        const geoResp = await fetch('https://gist.githubusercontent.com/john-guerra/43c7656821069d00dcbc/raw/be6a6e239cd5b5b803c6e7c2ec405b793a9064dd/Colombia.geo.json');
        const geoData = await geoResp.json();
        
        geojsonLayer = L.geoJSON(geoData, {
            style: stylePolygon,
            onEachFeature: function (feature, layer) {
                const name = feature.properties.NOMBRE_DPT;
                const stat = currentStats.find(s => s.nombre.toUpperCase() === name.toUpperCase() || (name === 'SANTAFE DE BOGOTA D.C' && s.nombre === 'Bogotá D.C.'));
                const total = stat ? parseInt(stat.total) : 0;
                layer.bindPopup(`<b>${name}</b><br>Feminicidios: ${total}`);
            }
        }).addTo(map);

    } catch (error) {
        console.error(error);
    }
}

async function loadDepartmentData(deCodigo, deName, year = 2025) {
    markerGroup.clearLayers();
    if (geojsonLayer) map.removeLayer(geojsonLayer);
    
    if (coords[deName]) {
        map.setView(coords[deName], 8);
    }

    try {
        // Cargar solo el polígono del departamento
        const geoResp = await fetch('https://gist.githubusercontent.com/john-guerra/43c7656821069d00dcbc/raw/be6a6e239cd5b5b803c6e7c2ec405b793a9064dd/Colombia.geo.json');
        const geoData = await geoResp.json();
        
        const singleFeature = geoData.features.filter(f => f.properties.NOMBRE_DPT.toUpperCase() === deName.toUpperCase() || (f.properties.NOMBRE_DPT === 'SANTAFE DE BOGOTA D.C' && deName === 'Bogotá D.C.'));
        
        geojsonLayer = L.geoJSON(singleFeature, {
            style: {
                fillColor: '#e11d48',
                weight: 2,
                opacity: 1,
                color: '#fff',
                fillOpacity: 0.2
            }
        }).addTo(map);

        if (singleFeature.length > 0) {
            map.fitBounds(geojsonLayer.getBounds());
        }

        const response = await fetch(`http://localhost:3000/api/municipios/${deCodigo}?year=${year}`);
        const cities = await response.json();

        let deptTotal = 0;
        cities.forEach(c => deptTotal += parseInt(c.total_casos));
        document.getElementById('total-nacional').textContent = deptTotal;

        const filteredCities = cities.filter(c => parseInt(c.total_casos) > 0);
        updateChart(`Municipios en ${deName}`, filteredCities.map(c => c.nombre), filteredCities.map(c => parseInt(c.total_casos)));

        filteredCities.forEach(city => {
            const total = parseInt(city.total_casos);
            if (cityCoords[city.nombre]) {
                const radius = Math.sqrt(total) * 5; 
                L.circleMarker(cityCoords[city.nombre], {
                    radius: radius > 5 ? radius : 5,
                    fillColor: "#9333ea", 
                    color: "#fff",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
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
