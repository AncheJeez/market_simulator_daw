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

Back-end
> cd back-end/docker
> docker compose up
> **(en otra terminal)**
> docker ps -a
> docker exec -it trading_db psql -U admin -d trading_simulator
> \l
> \c trading_simulator
> \dt
> **(si se quiere borrar y empezar de nuevo la db)
> docker ps -a
> docker rm -f [la id de la imagen]
> docker images
> docker rmi postgres:16
> **(O también se puede ir a la direccion de docker-compose.yml y meter)**
> docker compose down -v