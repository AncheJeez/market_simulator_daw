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

![alt text](https://github.com/AncheJeez/ProyectoIntegrado/blob/main/mock-up/DiagramaEntidadRelacionMermaid.png)

Front-end
> npx create-react-app front-end --template typescript <br>
> npm install sass --save-dev <br>
> npm install bootstrap <br>
> (opcional npm install react-bootstrap) <br>
> npm install react-router-dom <br>
> npm install @types/react-router-dom --save-dev <br>
> npm start <br>