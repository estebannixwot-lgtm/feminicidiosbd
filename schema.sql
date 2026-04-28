CREATE TABLE DEPARTAMENTO (
    gid serial PRIMARY KEY,
    deCodigo varchar(2) UNIQUE NOT NULL,
    deNombre varchar(100),
    geom geometry
);

CREATE TABLE ESTADISTICAS_FEMINICIDIOS_POR_DEPARTAMENTO (
    id_estadistica serial PRIMARY KEY,
    deCodigo varchar(2) REFERENCES DEPARTAMENTO(deCodigo),
    anio integer,
    total_feminicidios integer,
    porcentaje_nacional numeric
);

CREATE TABLE MUNICIPIO (
    gid serial PRIMARY KEY,
    dpto_ccdgo varchar(2) REFERENCES DEPARTAMENTO(deCodigo),
    mpio_cnmbr varchar(28),
    mpio_ccdgo varchar(5) UNIQUE,
    geom geometry
);

CREATE TABLE VICTIMA (
    gid serial PRIMARY KEY,
    id_victima double precision,
    doc_identi double precision UNIQUE NOT NULL,
    edad integer,
    mpio_ccdgo_na varchar(5) REFERENCES MUNICIPIO(mpio_ccdgo),
    mpio_ccdgo_res varchar(5) REFERENCES MUNICIPIO(mpio_ccdgo),
    etnia varchar(10),
    nivel_educ varchar(10),
    ocupacion varchar(10),
    fuente_ing varchar(10),
    num_hijos integer,
    fam_cerca boolean,
    deta_fami varchar(50),
    ant_vio_pr varchar(50),
    medida_pro boolean,
    fecha_medi date,
    tipo_medi varchar(30),
    entidad_em varchar(50),
    identidad_genero varchar(50),
    orientacion_sexual varchar(50),
    nacionalidad varchar(50),
    condicion_embarazo boolean,
    regimen_salud varchar(50),
    geom geometry
);

CREATE TABLE AGRESOR (
    gid serial PRIMARY KEY,
    doc_identi double precision UNIQUE NOT NULL,
    edad integer,
    nivel_educ varchar(10),
    mpio_ccdgo_res varchar(5) REFERENCES MUNICIPIO(mpio_ccdgo),
    ocupacion varchar(15),
    fuente_ing varchar(10),
    relacionvi varchar(15),
    ant_penal boolean,
    reincident boolean,
    desc_ant double precision,
    sexo varchar(20),
    consumo_alcohol_sustancias boolean,
    amenazas_previas boolean,
    geom geometry
);

CREATE TABLE FUENTE_INFORMACION (
    gid serial PRIMARY KEY,
    id_fuente double precision UNIQUE NOT NULL,
    nombre_insti varchar(30),
    tipo_fuent varchar(30),
    geom geometry
);

CREATE TABLE CASO_FEMINICIDIO (
    gid serial PRIMARY KEY,
    id_caso double precision,
    fecha date,
    doc_victima double precision REFERENCES VICTIMA(doc_identi),
    doc_agresor double precision REFERENCES AGRESOR(doc_identi),
    mpio_ccdgo varchar(5) REFERENCES MUNICIPIO(mpio_ccdgo),
    id_fuente double precision REFERENCES FUENTE_INFORMACION(id_fuente),
    tipo_femi varchar(10),
    meca_lesi varchar(50),
    vio_asociada varchar(50),
    zona_ubi varchar(10),
    estra_pred integer,
    dist_insti double precision,
    acoso_digi boolean,
    tenen_viv varchar(80),
    num_hijos integer,
    presen_hij boolean,
    estado_jud varchar(50),
    captu_fla boolean,
    tipifi_ini varchar(50),
    fecha_cap date,
    result_jud varchar(50),
    geom geometry
);

CREATE TABLE ESTADISTICAS_NACIONALES (
    id_nacional serial PRIMARY KEY,
    anio integer UNIQUE,
    total_feminicidios integer,
    arma_mas_usada varchar(100),
    arma_fuego_count integer,
    arma_cortopunzante_count integer,
    edad_mas_frecuente integer,
    edad_20_29count integer,
    porcentaje_zona_urbana numeric,
    porcentaje_zona_rural numeric,
    hijos_huerfanos integer,
    hijas_huerfanas integer,
    madres_gestantes_pct numeric,
    sujeto_feminicida_mas_comun varchar(100),
    parentesco_mas_comun varchar(100)
);
