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
> cd front-end <br>
> npm install <br>
> npm i react-router-dom <br>
> npm i react-pro-sidebar <br>
> npm run dev <br>



Back-end
> cd back-end/docker <br>
> docker compose up <br>
**(en otra terminal)** <br>
> docker ps -a <br>
> docker exec -it trading_db psql -U admin -d trading_simulator <br>
> \l <br>
> \c trading_simulator <br>
> \dt <br>
**(si se quiere borrar y empezar de nuevo la db)** <br>
> docker ps -a <br>
> docker rm -f [la id de la imagen] <br>
> docker images <br>
> docker rmi postgres:16 <br>
**(O también se puede ir a la direccion de docker-compose.yml y meter)** <br>
> docker compose down -v <br>