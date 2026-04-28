const { Pool } = require('pg');
const fs = require('fs');
const https = require('https');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'feminicidios',
  password: 'admin',
  port: 5433,
});

https.get('https://gist.githubusercontent.com/john-guerra/43c7656821069d00dcbc/raw/be6a6e239cd5b5b803c6e7c2ec405b793a9064dd/Colombia.geo.json', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', async () => {
    try {
      const geoData = JSON.parse(data);
      console.log('GeoJSON loaded. Updating DB...');
      for (const feature of geoData.features) {
        let name = feature.properties.NOMBRE_DPT;
        if (name === 'SANTAFE DE BOGOTA D.C') name = 'Bogotá D.C.';
        // Fix names to match what we have in DB
        const matchName = name.toUpperCase();
        
        // Find deCodigo
        const res = await pool.query('SELECT deCodigo FROM DEPARTAMENTO WHERE UPPER(deNombre) = $1', [matchName]);
        if (res.rows.length > 0) {
          const deCodigo = res.rows[0].decodigo;
          const geomJson = JSON.stringify(feature.geometry);
          // Update the geometry column
          await pool.query('UPDATE DEPARTAMENTO SET geom = ST_GeomFromGeoJSON($1) WHERE deCodigo = $2', [geomJson, deCodigo]);
        }
      }
      console.log('Database geometries updated successfully.');
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
