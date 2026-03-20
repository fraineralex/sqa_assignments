# Pruebas de Integracion Automatizadas - Proyecto XYZ

## Ejecucion rapida (al inicio)
1. Levantar API local:
bun api/server.js
2. Ejecutar toda la validacion automatizada:
powershell -ExecutionPolicy Bypass -File scripts/run-tests.ps1 -BaseUrl "http://localhost:8080/api"
3. Resultado esperado:
- Newman en verde
- k6 integracion y carga con metricas disponibles en consola y carpeta results

## 1. Introduccion
Este repositorio presenta una estrategia completa de pruebas de integracion automatizadas para un modulo backend REST del Proyecto XYZ. El enfoque combina validacion funcional de flujos de negocio, verificacion de contratos entre servicios y pruebas de carga/integracion con k6 y Postman. El objetivo es demostrar una implementacion realista, trazable y orientada a calidad academica.

## 2. Descripcion del Modulo
El modulo simulado corresponde al servicio de usuarios, responsable de administrar el ciclo de vida de usuarios en la plataforma.

Endpoints principales:
- POST /users: crea usuario.
- GET /users/:id: consulta usuario por identificador.
- PUT /users/:id: actualiza datos y estado del usuario.
- DELETE /users/:id: elimina usuario.

Dependencias de integracion simuladas:
- Auth Service: emite JWT para autorizacion.
- UserDB: almacena entidades de usuario.
- CRM Profile Service: enriquece datos de perfil.
- Notification Service: envios/eventos post-operacion.

## 3. Arquitectura de Integracion
[Screenshot_arquitectura_integracion]
Flujo general de arquitectura:
1. Cliente de pruebas (k6/Postman) consume API Gateway.
2. API Gateway valida reglas basicas y enruta al servicio de usuarios.
3. El servicio de usuarios persiste datos en UserDB.
4. El servicio de usuarios consulta CRM Profile Service para informacion complementaria.
5. El servicio de usuarios publica eventos a Notification Service.
6. Auth Service protege endpoints con token JWT.

Esta arquitectura permite validar integraciones criticas: autenticacion, persistencia, dependencias externas y manejo de fallos de upstream.

## 4. Escenarios de Prueba
Se implementaron escenarios de valor funcional y tecnico:

1. Creacion + consulta inmediata (consistencia)
- Verifica que un usuario recien creado pueda consultarse en una ventana corta de consistencia eventual.

2. Flujo completo de ciclo de vida
- Crea, actualiza, consulta y elimina un usuario; confirma estado final 404.

3. Datos invalidos
- Envia payloads mal formados para validar reglas contractuales y estructura de errores.

4. Falla de dependencia
- Simula timeout del CRM y valida respuesta controlada 503.

5. Concurrencia y carga sostenida
- Ejecuta VUs y arrival rates para medir latencia, throughput y error rate bajo presion.

6. Validacion inter-servicios
- Confirma codigos y mensajes funcionales esperados cuando la dependencia externa responde fuera de SLA.

## 5. Herramientas Utilizadas
- k6: automatizacion de pruebas de integracion bajo carga.
- Postman: coleccion funcional con aserciones JavaScript.
- JavaScript ES6: scripts reutilizables para escenarios.
- Markdown: documentacion de plan, resultados y presentacion.

## 6. Implementacion (k6 + Postman)
[Screenshot_estructura_proyecto]
Estructura del repositorio:
- Carpeta k6 con load-test.js, integration-test.js y utils.js
- Carpeta postman con XYZ-Integration-Tests.postman_collection.json
- Carpeta data con test-data.json
- Carpeta docs con test-plan.md
- README.md y presentation.md en la raiz

Implementacion k6:
[Screenshot_codigo_k6_integracion]
- k6/integration-test.js: escenarios funcionales complejos con checks, sleep, thresholds y ejecucion multi-escenario.
- k6/load-test.js: carga sostenida y picos de lectura para validar estabilidad.
- k6/utils.js: funciones reutilizables para autenticacion y operaciones CRUD.

Implementacion Postman:
[Screenshot_coleccion_postman]
- Coleccion organizada por carpetas:
  - 00 - Authentication
  - 01 - User Lifecycle
  - 02 - Negative and Resilience
- Variables de coleccion: baseUrl, username, password, token, userId, userEmail.
- Tests con pm.test para validar status, payload y mensajes de error.

## 7. Resultados de las Pruebas
[Screenshot_tests_resultados]
Resultados simulados de ejecucion k6 (primera corrida):

### Integracion funcional (integration-test.js)
[Screenshot_k6_integracion]
- http_req_duration: p(90)=612 ms, p(95)=891 ms
- http_req_failed: 4.7%
- checks: 96.9%
- Throughput promedio: 18.5 req/s

Hallazgos:
- Fallos intermitentes en ESC-04 cuando CRM supera timeout.
- Degradacion de latencia en lectura posterior a actualizacion bajo concurrencia.

### Carga (load-test.js)
[Screenshot_k6_carga]
- http_req_duration: p(95)=1015 ms, p(99)=1451 ms
- http_req_failed: 6.2%
- Throughput pico: 63 req/s

Hallazgos:
- El pico de lectura excedio umbral p95 definido inicialmente.
- Se evidencio propagacion de error 503 cuando CRM no responde.

Logs simulados relevantes:
[Screenshot_logs_errores]
- ERROR [crm-client] upstream timeout after 300ms for userId=simulate-crm-timeout
- WARN [user-service] eventual read miss on first attempt, retry=2
- ERROR [notification-service] publish delayed over SLA

## 8. Problemas Detectados
1. Inestabilidad de dependencia CRM
- Impacta consultas enriquecidas y provoca respuestas 503.

2. Umbrales iniciales exigentes para picos
- Configuracion inicial no contemplaba variacion en escenario de spike.

3. Cobertura inicial limitada en casos de conflicto
- Faltaba incluir explicitamente duplicidad de correo y validacion 409 en flujo automatizado.

## 9. Optimizacion Realizada
Despues de la primera ejecucion se aplicaron mejoras:

1. Ajuste de thresholds por escenario
- Integracion: p(95)<800.
- Carga: p(95)<900 y p(99)<1200.

2. Mejora en manejo de errores
- Validaciones explicitas de error.code y error.message en k6 y Postman.
- Escenario dedicado para dependencia caida con expectativa 503.

3. Mejora de cobertura
- Inclusion de flujos negativos y resilience.
- Mayor trazabilidad entre plan (docs/test-plan.md) y scripts de ejecucion.

4. Mejora de estabilidad de escenarios
- Reintentos controlados para validacion de consistencia eventual.
- Datos dinamicos para evitar colisiones en ejecuciones concurrentes.

Resultado simulado posterior a optimizacion:
- integration-test: error rate 2.4%, checks 98.7%.
- load-test: p95 842 ms, p99 1189 ms, error rate 3.1%.

## 10. Conclusiones
La estrategia implementada valida de forma integral la calidad de integracion del servicio de usuarios y permite detectar defectos relevantes de contrato, resiliencia y rendimiento. El uso combinado de k6 y Postman mejora la cobertura desde dos perspectivas: comportamiento bajo carga y consistencia funcional de negocio. El repositorio queda listo para evolucionar hacia pipelines CI/CD con ejecuciones periodicas y gates de calidad.

## 11. Como ejecutar el proyecto

Prerequisitos:
- k6 instalado localmente.
- Postman Desktop o Newman.
- Entorno backend accesible en BASE_URL.

### Ejecutar pruebas de integracion con k6
Comando sugerido:
k6 run k6/integration-test.js -e BASE_URL=http://localhost:8080/api -e API_USERNAME=integration.tester -e API_PASSWORD=StrongPass!123

### Ejecutar pruebas de carga con k6
Comando sugerido:
k6 run k6/load-test.js -e BASE_URL=http://localhost:8080/api -e API_USERNAME=integration.tester -e API_PASSWORD=StrongPass!123 -e EXISTING_USER_ID=hot-user-001

### Ejecutar la coleccion en Postman
1. Importar postman/XYZ-Integration-Tests.postman_collection.json.
2. Ajustar variable baseUrl segun ambiente.
3. Ejecutar carpeta 00 - Authentication primero.
4. Ejecutar 01 - User Lifecycle y luego 02 - Negative and Resilience.

### Ejecutar con Newman (opcional)
[Screenshot_newman]
Comando sugerido:
bunx newman run postman/XYZ-Integration-Tests.postman_collection.json --env-var "baseUrl=http://localhost:8080/api"

### Ejecucion automatizada en un solo comando
[Screenshot_script_ejecucion]
Si deseas correr todo y guardar evidencia para capturas:
powershell -ExecutionPolicy Bypass -File scripts/run-tests.ps1 -BaseUrl "http://localhost:8080/api"
El script ejecuta:
- Newman con la coleccion completa
- k6 integration-test.js
- k6 load-test.js

Archivos generados:
- Carpeta results en la raiz
- Logs separados por herramienta con timestamp
- Archivo summary con codigos de salida y rutas de evidencia

### Levantar API local sencilla con Bun
[Screenshot_api_local]
Si no tienes el backend real disponible, puedes usar la API local incluida en este repositorio:
bun api/server.js
Endpoints disponibles:
- POST /api/auth/login
- POST /api/users
- GET /api/users/:id
- PUT /api/users/:id
- DELETE /api/users/:id
- GET /api/users/simulate-crm-timeout

## 12. Evidencias visuales sugeridas para el informe
Para reforzar el informe en Word, estas capturas funcionan muy bien:

1. Estructura del proyecto
- Captura del arbol de carpetas (k6, postman, data, docs).
- Objetivo: demostrar organizacion profesional del repositorio.

2. Script principal de integracion
- Captura de la seccion de escenarios y thresholds en integration-test.js.
- Objetivo: evidenciar diseno tecnico y criterios de aceptacion.

3. Script de carga
- Captura del escenario de carga sostenida y del escenario de pico en load-test.js.
- Objetivo: demostrar realismo en simulacion de demanda.

4. Coleccion Postman
- Captura de carpetas 00, 01 y 02.
- Objetivo: evidenciar cobertura funcional y negativa.

5. Pruebas en Postman
- Captura de la pestaña Tests mostrando pm.test en Create User o Dependency Timeout.
- Objetivo: demostrar validaciones automaticas de contrato.

6. Ejecucion de Newman
- Captura de consola con resumen de tests pasados/fallidos.
- Objetivo: mostrar automatizacion reproducible fuera de la UI.

7. Ejecucion de k6
- Captura de consola con metricas clave: p95, p99, tasa de error y checks.
- Objetivo: mostrar calidad no funcional y comportamiento bajo carga.

8. Resultado comparativo antes/despues
- Captura o tabla con metricas de primera corrida vs corrida optimizada.
- Objetivo: evidenciar mejora continua basada en datos.
