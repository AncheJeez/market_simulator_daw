CREATE DATABASE trading_simulator;

DROP TABLE IF EXISTS comentario CASCADE;
DROP TABLE IF EXISTS simulacion CASCADE;
DROP TABLE IF EXISTS grafica CASCADE;
DROP TABLE IF EXISTS relevant_news CASCADE;
DROP TABLE IF EXISTS favorito_nm CASCADE;
DROP TABLE IF EXISTS tipo_industria CASCADE;
DROP TABLE IF EXISTS tipo CASCADE;
DROP TABLE IF EXISTS industria CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;


CREATE TABLE IF NOT EXISTS usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL,
    usuario VARCHAR(255) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL,
    dinero_simulado NUMERIC(15,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS industria (
    id_industria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    breve_descripcion TEXT,
    volume NUMERIC(15,2),
    open_interest NUMERIC(15,2),
    simbolo_ticker VARCHAR(10),
    precio_actual NUMERIC(15,2)
);

CREATE TABLE IF NOT EXISTS tipo (
    id_tipo SERIAL PRIMARY KEY,
    descripcion VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS tipo_industria (
    id_industria INT NOT NULL,
    id_tipo INT NOT NULL,
    PRIMARY KEY (id_industria, id_tipo),
    FOREIGN KEY (id_industria) REFERENCES industria(id_industria) ON DELETE CASCADE,
    FOREIGN KEY (id_tipo) REFERENCES tipo(id_tipo) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS favorito_nm (
    id_usuario INT NOT NULL,
    id_industria INT NOT NULL,
    fecha_agregado DATE DEFAULT CURRENT_DATE,
    PRIMARY KEY (id_usuario, id_industria),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_industria) REFERENCES industria(id_industria) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS relevant_news (
    id_news SERIAL PRIMARY KEY,
    id_industria INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    fecha_publicacion DATE,
    FOREIGN KEY (id_industria) REFERENCES industria(id_industria) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS grafica (
    id_grafica SERIAL PRIMARY KEY,
    datos_grafica JSONB
);

CREATE TABLE IF NOT EXISTS simulacion (
    id_simulacion SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_grafica INT,
    id_industria INT NOT NULL,
    variacion_de_mercado NUMERIC(10,4),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_grafica) REFERENCES grafica(id_grafica) ON DELETE SET NULL,
    FOREIGN KEY (id_industria) REFERENCES industria(id_industria) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comentario (
    id_comentario SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_industria INT NOT NULL,
    contenido TEXT NOT NULL,
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_industria) REFERENCES industria(id_industria) ON DELETE CASCADE
);