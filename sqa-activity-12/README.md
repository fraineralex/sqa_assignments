# Pruebas de carga con k6 — Actividad 12

**Asignatura:** Aseguramiento de la Calidad del Software  
**Práctica:** Automatización de pruebas de carga y rendimiento con **k6** sobre una API REST pública utilizada como sistema objetivo (perfil similar a producción para fines académicos).

Este entregable replica la línea de trabajo de **sqa-activity-14** (scripts en carpeta `k6/`, utilidades compartidas, documentación tipo informe y carpeta `results/`), pero se centra exclusivamente en **performance** frente a endpoints de usuarios.

---

## 1. Introducción

k6 es una herramienta moderna de pruebas de carga orientada a desarrolladores. Permite definir escenarios con rampas de usuarios virtuales (VUs), umbrales de calidad (thresholds) y comprobaciones (`check`) sobre cada respuesta HTTP. En este proyecto se modela un conjunto de operaciones típicas de un servicio de usuarios: listado, lectura por identificador, creación y lecturas concurrentes mediante `http.batch`, de forma modular y reutilizable.

El sistema bajo prueba, por defecto, es la API pública **JSONPlaceholder** (`/users`, `/users/:id`, `POST /users`). Es un entorno compartido; los resultados sirven para ilustrar metodología, métricas e interpretación, no para certificar un SLA contractual de un cliente real. Para acercarse a un entorno controlado se puede apuntar `BASE_URL` a una API propia o a un mock interno.

---

## 2. Objetivo

- Automatizar pruebas de **carga nominal**, **pico (spike)** y **estrés** con scripts k6 ejecutables localmente.  
- Medir y documentar **throughput**, **latencias** (promedio, p95, p99), **tasa de fallos HTTP** y **tasa de éxito de checks**.  
- Generar **evidencia en JSON** mediante `k6 run --out json=...` y complementar con un **resumen interpretado** en `results/sample-results.json`.  
- Entregar **documentación** que permita replicar la práctica y **conclusiones** accionables sobre rendimiento.

---

## 3. Escenarios de prueba

| Escenario | Archivo | Intención | Comportamiento resumido |
|-----------|---------|-----------|-------------------------|
| Carga nominal | `k6/load-test.js` | Validar comportamiento estable con rampa de subida, meseta y bajada | `stages` hasta 40 VUs; umbrales estrictos en p95/p99 y checks |
| Pico (spike) | `k6/spike-test.js` | Simular un aumento brusco de concurrencia | Subida rápida a 120 VUs, meseta corta y recuperación |
| Estrés | `k6/stress-test.js` | Empujar el sistema con presión sostenida y mayor frecuencia de trabajo por iteración | Hasta 100 VUs, más lecturas por iteración y `sleep` corto |
| Peticiones concurrentes | Incluido en todos | Validar paralelismo controlado | `http.batch` con cuatro GET en cada iteración |

Criterios de negocio reflejados en `check()`:

- Listado `GET /users`: código 200 y cuerpo tipo arreglo.  
- Detalle `GET /users/:id`: código 200 y presencia de `id`.  
- Alta `POST /users`: código 201 y `id` en la respuesta.  
- Lote concurrente: todas las respuestas del batch con estado 200.

---

## 4. Configuración del entorno

### Instalación de k6

Sigue la guía oficial: [https://k6.io/docs/get-started/installation/](https://k6.io/docs/get-started/installation/). En Windows, el binario `k6` debe quedar disponible en el `PATH` (comprueba con `k6 version`).

### Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `BASE_URL` | Origen de la API sin barra final. Por defecto: `https://jsonplaceholder.typicode.com` |

Ejemplo en PowerShell:

```powershell
$env:BASE_URL = "https://jsonplaceholder.typicode.com"
k6 run k6/load-test.js
```

### Ejecución local (paso principal)

Desde la raíz de `sqa-activity-12`:

```powershell
k6 run k6/load-test.js
```

Salida JSON (práctica paso 8 / informes):

```powershell
New-Item -ItemType Directory -Force -Path results | Out-Null
k6 run --out json=results/run-load.json k6/load-test.js
```

### Orquestación de las tres corridas (opcional)

```powershell
.\scripts\run-tests.ps1
```

El script genera archivos `results/run-*.json` con marca de tiempo. Los archivos `run-*.json` están ignorados por `.gitignore` para no llenar el repositorio; conserva `sample-results.json` como referencia académica.

---

## 5. Scripts implementados

Estructura del proyecto:

```
sqa-activity-12/
├── k6/
│   ├── load-test.js
│   ├── stress-test.js
│   ├── spike-test.js
│   └── utils.js
├── results/
│   └── sample-results.json
├── scripts/
│   └── run-tests.ps1
├── .gitignore
└── README.md
```

- **`utils.js`**: resuelve `BASE_URL`, construye payloads de alta, ejecuta `GET`/`POST`, agrupa peticiones concurrentes con `http.batch` y centraliza los `check()` reutilizables.  
- **`load-test.js`**: `stages` de rampa y descenso; `thresholds` sobre duración global, submétricas por etiqueta `name` en GET listado y POST, tasa de fallos HTTP y tasa de checks.  
- **`spike-test.js`**: perfil de pico con umbrales algo más tolerantes para reflejar la tensión del tráfico repentino.  
- **`stress-test.js`**: mayor carga sostenida y más lecturas por iteración; umbrales relajados respecto a la carga nominal para estudiar degradación.

Cada script usa `sleep()` para modelar tiempo de pensamiento del usuario entre iteraciones.

---

## 6. Resultados

### Salida estándar de k6

Al finalizar, k6 imprime un resumen con, entre otras:

- **`http_reqs`**: total de solicitudes y **tasa (req/s)** — throughput observado.  
- **`http_req_duration`**: estadísticos de latencia (**avg**, **p90**, **p95**, **p99**).  
- **`http_req_failed`**: proporción de respuestas HTTP no exitosas según criterio de k6.  
- **`checks`**: porcentaje de aserciones de negocio satisfechas.  
- **`iteration_duration`**: tiempo de cada iteración del `default function`.

### Archivo `results/sample-results.json`

Contiene tres bloques `runs` (carga, pico, estrés) con números **representativos** de una campaña de medición: totales de requests, tasas, latencias, checks y el estado **pass/fail** de los `thresholds`. Sirve como plantilla para comparar contra tus propias corridas reales y como anexo de informe cuando se entrega documentación sin adjuntar JSON masivo.

### Gráficos

k6 en consola ofrece barras de progreso y resumen numérico. Para gráficos interactivos habituales en la industria se puede exportar a **Grafana Cloud k6** o a **InfluxDB + Grafana**; en el ámbito académico suele bastar el JSON y el resumen textual más capturas de pantalla del final de corrida.

---

## 7. Análisis

Interpretación típica de las métricas:

- **p95 / p99 de `http_req_duration`**: cola de latencia experimentada por la mayoría de usuarios; un p95 alto con p99 mucho mayor sugiere contención, colas en el servidor o red inestable.  
- **`http_req_failed`**: errores de red, timeouts o códigos 5xx/4xx según configuración; valores altos bajo carga indican saturación o límites de tasa del proveedor (especialmente en APIs públicas).  
- **`checks`**: aunque el HTTP sea 200, el negocio puede fallar (payload inesperable); un check bajo con HTTP “verde” apunta a regresiones funcionales o contratos rotos.  
- **Throughput (req/s)**: capacidad observada bajo el escenario; debe leerse junto con la latencia: más req/s con latencias altas no implica un sistema saludable.

En el ejemplo sintético de `sample-results.json`, la corrida de **estrés** muestra `thresholds.http_req_duration_p95_2500ms` en **fail** mientras la tasa de fallos HTTP aún cumple su umbral: es un patrón coherente con **degradación de tiempos** antes de colapsar completamente el servicio, útil para planificar autoescalado, límites de conexión o optimización de consultas en un backend real.

---

## 8. Conclusiones

- Los tres scripts cubren **carga nominal**, **pico** y **estrés** con configuraciones distintas de `stages` y `thresholds`, alineado con la práctica docente.  
- La lógica común en **`utils.js`** reduce duplicación y facilita el mantenimiento, en la misma filosofía que el módulo compartido de **sqa-activity-14**.  
- Sobre JSONPlaceholder, los resultados dependen de Internet y de límites del servicio demo; el valor del ejercicio está en el **método**, no en el número absoluto de req/s.  
- La integración de **`check`**, **`sleep`**, **`http.batch`** y **submétricas por tags** demuestra un nivel intermedio-avanzado adecuado para informe académico.

---

## 9. Recomendaciones

- Repetir cada escenario **varias veces** y comparar dispersión de p95/p99.  
- Si el curso exige gráficos formales, exportar `--out json` y procesar con un notebook o Grafana, o usar **k6 Cloud** en su capa gratuita si la política institucional lo permite.  
- Para aproximarse a producción, desplegar una API propia (por ejemplo la de **sqa-activity-14**) y fijar `BASE_URL` hacia `http://localhost:...`, controlando así la versión del backend y la base de datos.  
- En **CI/CD** (paso opcional de la guía), añadir un job que ejecute `k6 run` con `--vus` y `--duration` reducidos en cada push, o la corrida completa en horario nocturno; documentar tokens y límites para no saturar pipelines.  
- Ajustar umbrales a SLAs reales del negocio y añadir escenarios de **soak** (larga duración a carga media) si el curso lo requiere.

---

## Entrega sugerida

- Scripts en `k6/`.  
- Evidencias: al menos un `results/run-*.json` generado localmente y/o `sample-results.json` como referencia.  
- Este `README.md` como documentación e informe.  
- (Opcional) capturas del resumen final en consola o dashboard.

---

**Identificación:** Actividad 12 — Automatización de pruebas de carga y rendimiento con k6.
