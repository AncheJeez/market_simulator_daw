# ProyectoIntegrado
Proyecto DAW

Tecnologías a usar:

Frontend -> Typescript con React (con recharts para las gráficas), Bootstrap y Sass

Backend -> Springboot

API -> [Alpha Vantage](https://www.alphavantage.co/documentation/ "Alpha Vantage")

Librerías
> spring-boot-starter-web (Para API REST) <br>
> spring-boot-starter-data-jpa (puente entre Java y PostreSQL) <br>
> postgresql (driver JDBC para hablar con PostgreSQL) <br>
> spring-boot-starter-validation (herramienta de validación para las classes) <br>
> springdoc-openapi-ui (testeo de la API) <br>

Base de datos -> Postgre dockerizado (testeo en local y luego desplegado en el servidor)

Despliegue -> Frontend en Vercel?? Backend en fly.io??

![alt text](https://github.com/AncheJeez/ProyectoIntegrado/blob/main/fichero_mock-up/DiagramaEntidadRelacionMermaid.png)

npx create-react-app .
npm install sass --save-dev
npm install react-router-dom
npm start