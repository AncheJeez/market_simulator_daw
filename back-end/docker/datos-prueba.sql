
-- Inserts de prueba
INSERT INTO usuario(nombre, usuario, apellidos, contrasena, email, rol, dinero_simulado) VALUES
('Andres','Sanchez','administrador','admin123','andres.sanchez@iescamas.es','admin',10000.00),
('Maria','Lopez','marial','pass123','maria.lopez@example.com','user',15000.50),
('Carlos','García','carlosg','pass123','carlos.garcia@example.com','user',5000.25),
('Lucia','Fernández','luciaf','pass123','lucia.fernandez@example.com','user',12000.00),
('Jose','Martinez','josem','pass123','jose.martinez@example.com','user',8000.75),
('Ana','Torres','anat','pass123','ana.torres@example.com','user',9500.00),
('David','Gómez','davidg','pass123','david.gomez@example.com','user',11000.25),
('Laura','Ruiz','laurar','pass123','laura.ruiz@example.com','user',7000.50),
('Miguel','Castillo','miguelc','pass123','miguel.castillo@example.com','user',13000.00),
('Sara','Navarro','saran','pass123','sara.navarro@example.com','user',6000.00);

INSERT INTO operaciones (usuario_id, tipo_operacion, simbolo, cantidad, precio) VALUES
(1, 'compra', 'AAPL', 10, 150.00),
(1, 'venta', 'TSLA', 5, 700.00),
(2, 'compra', 'GOOGL', 3, 2800.00),
(2, 'compra', 'AMZN', 1, 3400.50),
(3, 'venta', 'NFLX', 2, 500.00),
(3, 'compra', 'MSFT', 8, 250.00);