# Plan de Pruebas de Integracion - Proyecto XYZ

## 1. Objetivo
Validar la integracion del modulo `User Service` dentro del ecosistema de microservicios del Proyecto XYZ, verificando consistencia, manejo de errores, contratos de API y resiliencia ante fallos de dependencias.

## 2. Alcance
- API REST de usuarios (`/users`).
- Integracion con `Auth Service` para emision y validacion de JWT.
- Integracion con `CRM Profile Service` para enriquecimiento de datos.
- Integracion con `Notification Service` para eventos post-creacion y post-actualizacion.
- Persistencia en `UserDB`.

## 3. Fuera de alcance
- Pruebas de interfaz grafica.
- Pruebas unitarias internas del servicio.
- Hardening de infraestructura y red.

## 4. Arquitectura de integracion objetivo
- Cliente de pruebas (k6 / Postman) invoca `API Gateway`.
- `API Gateway` aplica politicas basicas y enruta hacia `User Service`.
- `User Service` consulta/actualiza `UserDB`.
- `User Service` solicita datos complementarios a `CRM Profile Service`.
- `User Service` publica eventos a `Notification Service`.
- `Auth Service` emite token para autorizacion de endpoints.

## 5. Criterios de entrada
- Entorno de pruebas disponible.
- Endpoints desplegados en ambiente de integracion.
- Credenciales tecnicas habilitadas para automatizacion.
- Datos base semilla en `UserDB`.

## 6. Criterios de salida
- 100% de escenarios ejecutados.
- Sin fallos criticos abiertos en rutas principales.
- Tasa de error menor a 3% en prueba de carga.
- Evidencia de resultados consolidada en README.

## 7. Escenarios de integracion

### ESC-01: Creacion de usuario y consulta inmediata
1. Autenticar usuario tecnico.
2. Crear usuario con payload valido.
3. Consultar el recurso inmediatamente.
4. Reintentar lectura breve para validar consistencia eventual.
5. Verificar igualdad de datos clave (`id`, `email`, `status`).

Resultado esperado:
- `POST /users` retorna 201.
- `GET /users/:id` retorna 200 antes de 3 reintentos.

### ESC-02: Flujo completo de ciclo de vida
1. Crear usuario.
2. Actualizar nombre y estado.
3. Consultar cambios.
4. Eliminar usuario.
5. Validar respuesta 404 en consulta posterior.

Resultado esperado:
- Secuencia de estados valida: 201 -> 200 -> 200 -> 204 -> 404.

### ESC-03: Datos invalidos y validaciones contractuales
1. Enviar payload incompleto o con formato incorrecto.
2. Repetir correo ya existente.
3. Confirmar estructura estandar de error.

Resultado esperado:
- Respuestas 400/409 con `error.code` y `error.message` consistentes.

### ESC-04: Falla de dependencia externa
1. Simular timeout de `CRM Profile Service`.
2. Invocar consulta de usuario que depende del CRM.
3. Verificar degradacion controlada.

Resultado esperado:
- Respuesta 503 con mensaje de dependencia y trazabilidad.

### ESC-05: Concurrencia en creacion y lectura
1. Ejecutar multiples VUs creando usuarios en paralelo.
2. Realizar lecturas concurrentes sobre usuarios calientes.
3. Medir latencia percentil y tasa de error.

Resultado esperado:
- p95 < 900 ms en carga objetivo.
- Errores < 5% durante el pico.

## 8. Riesgos
- Inestabilidad temporal del entorno compartido.
- Datos residuales entre ejecuciones.
- Dependencias externas sin modo de simulacion estable.

## 9. Mitigaciones
- Generacion de datos unicos por iteracion.
- Limpieza de recursos al finalizar flujos.
- Umbrales diferenciados por tipo de escenario.

## 10. Evidencias requeridas
- Log de ejecucion k6 por escenario.
- Export de resultados agregados.
- Capturas de ejecucion Postman.
- Registro de defectos detectados y optimizaciones aplicadas.
