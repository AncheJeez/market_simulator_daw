# ProyectoIntegrado
Proyecto DAW

Para ejecutar este proyecto se necesita Git y Docker previamente instalados.<br>
Una vez lo estén haga lo siguiente desde la raíz del proyecto:<br>
> docker compose up --build <br>

y luego acceda a [la página](http://localhost:5173)<br>

Hay datos que son necesarios insertar en la base de datos para que funcione propiamente.<br>
Abra un terminal nuevoe introduzca en la raíz del proyecto:<br>
> docker compose exec postgres psql -U admin -d trading_simulator<br>

E introduzca los inserts de symbols.sql<br>

Si quiere reiniciar de forma segura el docker o una parte de ella o buildear una parte concreta:<br>
> docker compose restart backend <br>
> docker compose restart frontend <br>
> docker compose up --build -d backend <br>
> docker compose up --build -d frontend <br>
> docker compose down -v <br>
> docker compose up --build <br>

Para utilizar la API alphavantage necesita entrar a esta [página](https://www.alphavantage.co/support/#api-key) y solicitar una API key.<br>
Con esa key insertela en las opciones del perfil de usuario en la propia aplicación.<br>


Si quiere insertar datos manualmente a la base de datos postgre:<br>
> docker compose exec postgres psql -U admin -d trading_simulator<br>

Si quiere ejecutar el backend independientemente:<br>
> cd back-end <br>
> npm spring-boot:run <br>

Si quiere ejecutar el frontend independietemente:<br>
> cd front-end <br>
> npm install <br>
> npm i react-router-dom <br>
> npm i react-pro-sidebar <br>
> npm i reagraph <br>
> npm i react-chartjs-2 chart.js <br>
> npm run dev <br>

TODO:<br>
- Ahora mismo, el usuario tiene que poner una imagen de perfil, no es opcional <- fix
- Solo los admis deberian poder registrar otros roles otros de usuario normal.
- Simulaciones de trading de usuario y que estas se guarden en cada perfil.
- Portfolio enseñando esas simulacionones.
- API de noticias, con topic en financias.
- Cambio de tema, light, dark.
- Cambio de idiom, EN - ES.
- Añadir iconos SVG.
- Pantalla de administración (solo lo verán los admins)

Tecnologías usadas:

Frontend -> Typescript con React y Bootstrap (multiples dependencias)

Backend -> Springboot

API -> [Alpha Vantage](https://www.alphavantage.co/documentation/ "Alpha Vantage")

![alt text](https://github.com/AncheJeez/ProyectoIntegrado/blob/main/mock-up/DiagramaEntidadRelacionMermaid.png)
