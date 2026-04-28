-- Poblar municipios para Antioquia (05)
INSERT INTO MUNICIPIO (dpto_ccdgo, mpio_cnmbr, mpio_ccdgo) VALUES
('05', 'Medellín', '05001'),
('05', 'Bello', '05088'),
('05', 'Itagüí', '05360'),
('05', 'Envigado', '05266');

-- Poblar municipios para Bogotá D.C. (11) (Bogotá funciona como dpto y municipio)
INSERT INTO MUNICIPIO (dpto_ccdgo, mpio_cnmbr, mpio_ccdgo) VALUES
('11', 'Bogotá D.C.', '11001');

-- Poblar municipios para Atlántico (08)
INSERT INTO MUNICIPIO (dpto_ccdgo, mpio_cnmbr, mpio_ccdgo) VALUES
('08', 'Barranquilla', '08001'),
('08', 'Soledad', '08758'),
('08', 'Malambo', '08433');

-- Poblar municipios para Valle del Cauca (76)
INSERT INTO MUNICIPIO (dpto_ccdgo, mpio_cnmbr, mpio_ccdgo) VALUES
('76', 'Cali', '76001'),
('76', 'Buenaventura', '76109'),
('76', 'Palmira', '76520'),
('76', 'Tuluá', '76834');

-- Poblar municipios para Magdalena (47)
INSERT INTO MUNICIPIO (dpto_ccdgo, mpio_cnmbr, mpio_ccdgo) VALUES
('47', 'Santa Marta', '47001'),
('47', 'Ciénaga', '47189'),
('47', 'Fundación', '47288');

-- Crear una vista o tabla para Estadísticas por Municipio
-- (El modelo lógico tiene CASO_FEMINICIDIO que enlaza con mpio_ccdgo.
-- Vamos a insertar CASOS de feminicidio que apunten a esos municipios para poder contarlos).

-- Victimas genéricas para asociar a los casos
INSERT INTO VICTIMA (doc_identi, edad) VALUES 
(1001, 25), (1002, 30), (1003, 22), (1004, 28), (1005, 35),
(1006, 19), (1007, 40), (1008, 26), (1009, 31), (1010, 24);

-- Insertar Casos de Feminicidio agregados a los municipios
INSERT INTO CASO_FEMINICIDIO (id_caso, mpio_ccdgo, doc_victima, fecha) VALUES
(1, '05001', 1001, '2025-01-15'), (2, '05001', 1002, '2025-02-10'), (3, '05001', 1003, '2025-03-05'),
(4, '05088', 1004, '2025-01-20'), (5, '05360', 1005, '2025-04-12'),
(6, '11001', 1006, '2025-01-05'), (7, '11001', 1007, '2025-02-15'), (8, '11001', 1008, '2025-03-20'),
(9, '08001', 1009, '2025-01-11'), (10, '08758', 1010, '2025-02-22'),
(11, '76001', 1001, '2025-01-08'), (12, '76001', 1002, '2025-02-18'), (13, '76109', 1003, '2025-03-10'),
(14, '47001', 1004, '2025-01-25'), (15, '47189', 1005, '2025-02-28');
