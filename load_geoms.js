const { Pool } = require('pg');
const https = require('https');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'feminicidios',
  password: 'admin',
  port: 5433,
});

// Mapeo manual de nombres GeoJSON -> nombres en la BD
const nameMap = {
  'SANTAFE DE BOGOTA D.C': 'Bogotá D.C.',
  'ATLANTICO': 'Atlántico',
  'BOLIVAR': 'Bolívar',
  'BOYACA': 'Boyacá',
  'CAQUETA': 'Caquetá',
  'CORDOBA': 'Córdoba',
  'CHOCO': 'Chocó',
  'QUINDIO': 'Quindío',
  'SAN ANDRES': 'San Andrés y Providencia',
  'GUAINIA': 'Guainía',
  'VAUPES': 'Vaupés',
  'ANTIOQUIA': 'Antioquia',
  'CALDAS': 'Caldas',
  'CAUCA': 'Cauca',
  'CESAR': 'Cesar',
  'CUNDINAMARCA': 'Cundinamarca',
  'GUAVIARE': 'Guaviare',
  'HUILA': 'Huila',
  'LA GUAJIRA': 'La Guajira',
  'MAGDALENA': 'Magdalena',
  'META': 'Meta',
  'NARIÑO': 'Nariño',
  'NARINO': 'Nariño',
  'NORTE DE SANTANDER': 'Norte de Santander',
  'PUTUMAYO': 'Putumayo',
  'RISARALDA': 'Risaralda',
  'SANTANDER': 'Santander',
  'SUCRE': 'Sucre',
  'TOLIMA': 'Tolima',
  'VALLE DEL CAUCA': 'Valle del Cauca',
  'ARAUCA': 'Arauca',
  'CASANARE': 'Casanare',
  'AMAZONAS': 'Amazonas',
  'VICHADA': 'Vichada',
  'ARCHIPIELAGO DE SAN ANDRES PROVIDENCIA Y SANTA CATALINA': 'San Andrés y Providencia',
};

https.get('https://gist.githubusercontent.com/john-guerra/43c7656821069d00dcbc/raw/be6a6e239cd5b5b803c6e7c2ec405b793a9064dd/Colombia.geo.json', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', async () => {
    try {
      const geoData = JSON.parse(data);
      console.log(`GeoJSON loaded with ${geoData.features.length} features. Updating DB...`);
      
      let updated = 0;
      let notFound = [];

      for (const feature of geoData.features) {
        const rawName = feature.properties.NOMBRE_DPT;
        const dbName = nameMap[rawName] || rawName;
        
        // Search by exact name
        let res = await pool.query('SELECT deCodigo FROM DEPARTAMENTO WHERE deNombre = $1', [dbName]);
        
        if (res.rows.length === 0) {
          // Try ILIKE as fallback
          res = await pool.query("SELECT deCodigo FROM DEPARTAMENTO WHERE deNombre ILIKE $1", [`%${dbName.substring(0, 4)}%`]);
        }

        if (res.rows.length > 0) {
          const deCodigo = res.rows[0].decodigo;
          const geomJson = JSON.stringify(feature.geometry);
          await pool.query('UPDATE DEPARTAMENTO SET geom = ST_SetSRID(ST_GeomFromGeoJSON($1), 4326) WHERE deCodigo = $2', [geomJson, deCodigo]);
          updated++;
          console.log(`  ✓ ${rawName} -> ${dbName} (${deCodigo})`);
        } else {
          notFound.push(rawName);
          console.log(`  ✗ Not found: ${rawName} (tried: ${dbName})`);
        }
      }

      // Verificar resultado final
      const check = await pool.query('SELECT COUNT(*) as total FROM DEPARTAMENTO WHERE geom IS NOT NULL');
      console.log(`\nDone. Updated: ${updated}. Not found: ${notFound.length}`);
      console.log(`Total departments with geometry: ${check.rows[0].total}`);
      if (notFound.length > 0) console.log('Missing:', notFound);
      
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
