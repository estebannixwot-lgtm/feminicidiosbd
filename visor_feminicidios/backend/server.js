const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'feminicidios',
  password: 'admin',
  port: 5433,
});

app.get('/api/statistics', async (req, res) => {
  try {
    const depsQuery = `
      SELECT d.deNombre as nombre, e.total_feminicidios as total
      FROM DEPARTAMENTO d
      JOIN ESTADISTICAS_FEMINICIDIOS_POR_DEPARTAMENTO e ON d.deCodigo = e.deCodigo
      WHERE e.anio = 2025
      ORDER BY e.total_feminicidios DESC
    `;
    const depsResult = await pool.query(depsQuery);
    
    const natQuery = `
      SELECT anio, total_feminicidios
      FROM ESTADISTICAS_NACIONALES
      ORDER BY anio DESC
    `;
    const natResult = await pool.query(natQuery);
    
    res.json({
      departamentos: depsResult.rows,
      nacionales: natResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
