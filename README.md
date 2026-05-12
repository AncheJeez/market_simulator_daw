# ProyectoIntegrado

Proyecto DAW.

## Local development

Use Docker only for PostgreSQL:

```powershell
docker compose -f docker-compose.local.yml up -d
```

Run the backend locally:

```powershell
cd back-end
.\mvnw.cmd spring-boot:run
```

Run the frontend locally:

```powershell
cd front-end
npm install
npm run dev
```

Open the app at:

```text
http://localhost:5173
```

In local development the frontend uses Vite proxy rules, so `/api` and `/uploads` are forwarded to `http://localhost:8080`.

## Server deployment

Use Docker for PostgreSQL, backend, and frontend:

```powershell
docker compose up --build -d
```

Open the app at:

```text
http://localhost
```

The production frontend is served by nginx. It serves the React build and proxies `/api` and `/uploads` to the backend container.

Useful server commands:

```powershell
docker compose restart backend
docker compose restart frontend
docker compose up --build -d backend
docker compose up --build -d frontend
docker compose down
docker compose down -v
```

## Database

The PostgreSQL credentials are:

```text
Database: trading_simulator
User: admin
Password: admin123
```

The compose files initialize stocks from:

```text
back-end/testing-symbols.sql
```

To connect manually:

```powershell
docker compose exec postgres psql -U admin -d trading_simulator
```

For local development with `docker-compose.local.yml`:

```powershell
docker compose -f docker-compose.local.yml exec postgres psql -U admin -d trading_simulator
```

## Market data API

The app uses Yahoo Finance through the backend. No API key is required.

## Technologies

Frontend: TypeScript, React, Bootstrap, Vite.

Backend: Spring Boot.

Database: PostgreSQL.

![Entity relationship diagram](https://github.com/AncheJeez/ProyectoIntegrado/blob/main/mock-up/DiagramaEntidadRelacionMermaid.png)

npm i react-select

TODO:
-Hacer interfaz administrador, lista usuarios y modificaciones.
-Vista de envio de correos y notificaciones
-Programar fetchs diarios

-Integrar vista con subreddits de financias y post de twitter con #
-Mejorar dashboard y que sea mostrado independientemente de que el usuario esté logeado, igual que con las noticias.
-Apartados de noticias relacionadas con enconomia
-Seleccionar topics (TECNOLOGÍA Y SEMICONDUCTORES, FINANZAS Y BANCA, CONSUMO Y RETAIL, SALUD Y FARMACÉUTICAS, ENERGÍA E INDUSTRIA,COMUNICACIONES Y ENTRETENIMIENTO, AUTOMOTRIZ Y OTROS, ÍNDICES Y ETFS).
-Cada topic tiene un chat global para los usuarios, donde se guardan los comentarios.
-Vista ladder
-Vista portfolio (current gains and investments), otros usuarios pueden verte esta vista.
-Vista de trading
-Al seleccionar una empresa mostrar datos específicos.
-Pestaña de opciones (idioma, modo claro/oscuro)
