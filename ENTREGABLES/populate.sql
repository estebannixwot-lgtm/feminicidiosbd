INSERT INTO DEPARTAMENTO (deCodigo, deNombre) VALUES
('05', 'Antioquia'),
('11', 'Bogotá D.C.'),
('08', 'Atlántico'),
('76', 'Valle del Cauca'),
('47', 'Magdalena'),
('68', 'Santander'),
('54', 'Norte de Santander'),
('13', 'Bolívar'),
('19', 'Cauca'),
('25', 'Cundinamarca'),
('41', 'Huila')
ON CONFLICT (deCodigo) DO NOTHING;

INSERT INTO ESTADISTICAS_FEMINICIDIOS_POR_DEPARTAMENTO (deCodigo, anio, total_feminicidios) VALUES
('05', 2025, 92),
('11', 2025, 53),
('08', 2025, 44),
('76', 2025, 44),
('47', 2025, 35),
('68', 2025, 34),
('54', 2025, 30),
('13', 2025, 28),
('19', 2025, 28),
('25', 2025, 25),
('41', 2025, 25);

INSERT INTO ESTADISTICAS_NACIONALES (anio, total_feminicidios) VALUES
(2019, 571),
(2025, 621)
ON CONFLICT (anio) DO NOTHING;
