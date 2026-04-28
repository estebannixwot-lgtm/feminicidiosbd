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
    const year = req.query.year || 2025;
    
    // Todos los departamentos, conteo de casos en el año especificado
    const depsQuery = `
      SELECT d.deCodigo as codigo, d.deNombre as nombre, 
             COALESCE(e.total_feminicidios, 0) as total
      FROM DEPARTAMENTO d
      LEFT JOIN ESTADISTICAS_FEMINICIDIOS_POR_DEPARTAMENTO e 
             ON d.deCodigo = e.deCodigo AND e.anio = $1
      ORDER BY total DESC, d.deNombre ASC
    `;
    const depsResult = await pool.query(depsQuery, [year]);
    
    // Nacionales
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

app.get('/api/municipios/:deCodigo', async (req, res) => {
  try {
    const { deCodigo } = req.params;
    const year = req.query.year || 2025;
    const query = `
      SELECT m.mpio_cnmbr as nombre, 
             COALESCE(SUM(CASE WHEN EXTRACT(YEAR FROM c.fecha) = $2 THEN 1 ELSE 0 END), 0) as total_casos
      FROM MUNICIPIO m
      LEFT JOIN CASO_FEMINICIDIO c ON m.mpio_ccdgo = c.mpio_ccdgo
      WHERE m.dpto_ccdgo = $1
      GROUP BY m.mpio_cnmbr
      ORDER BY total_casos DESC, m.mpio_cnmbr ASC
    `;
    const result = await pool.query(query, [deCodigo, year]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
