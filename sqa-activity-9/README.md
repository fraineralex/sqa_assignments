# Actividad 9 - Automatización de pruebas con Selenium

**Asignatura:** Aseguramiento de la Calidad del Software  
**Práctica:** Actividad - Selenium - 9

Este repositorio corresponde a la **Actividad 9**. El objetivo es demostrar automatización con **Selenium WebDriver**, escenarios y casos documentados, esperas implícitas y explícitas, aserciones sobre la interfaz, ejecución reproducible e **informes de resultados** (HTML y JUnit XML). La **entrega en video** la completas tú grabando la ejecución y el navegador.

## Objetivo de la práctica

Automatizar pruebas contra un sitio elegido, verificar comportamientos esperados con comprobaciones explícitas y documentar el proceso para que otra persona pueda replicarlo.

## Sitio bajo prueba (paso 1 - selección)

- **URL:** [https://fraineralex.dev/blog](https://fraineralex.dev/blog)  
- **Tipo:** sitio público (blog).  
- **Motivo:** contenido estable (artículos, enlaces, pie de página) y flujos claros para navegación, scroll y pestañas.

## Entorno y configuración (paso 2)

| Requisito | Detalle |
|-----------|---------|
| Lenguaje | Python 3.10 o superior |
| Librería | Selenium 4.x (`requirements.txt`) |
| Navegador | Microsoft Edge instalado en Windows (WebDriver resuelto por Selenium Manager) |
| Red | Conexión a Internet para cargar el sitio |

Instalación de dependencias:

```bash
cd sqa-activity-9
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Con [uv](https://github.com/astral-sh/uv) (opcional):

```bash
uv pip install -r requirements.txt
uv run python main.py
```

## Escenarios de prueba identificados (paso 3)

1. **Navegación inicial:** abrir el blog y comprobar que la URL cargada corresponde al sitio elegido.  
2. **Localización de elementos:** usar selectores CSS y por nombre de etiqueta para artículos, enlaces y pie de página.  
3. **Clic y navegación:** abrir enlaces dentro de artículos, validar que hay título de página y volver con `back()`.  
4. **Entrada por teclado:** enviar `End` / `Home` al cuerpo del documento para desplazamiento.  
5. **Esperas explícitas:** esperar visibilidad de artículos y presencia del `footer`.  
6. **Contenido dinámico:** esperar a que la sección de carga deje de aplicarse y comprobar enlaces del pie.  
7. **JavaScript:** scroll vía `execute_script`, lectura de `document.title` y `location.href`.  
8. **Cookies:** lectura del almacén de cookies del navegador para la sesión.  
9. **Ventanas / pestañas:** abrir pestaña, navegar a otro origen, cerrar y volver a la ventana original.  
10. **Ciclo de vida del WebDriver:** iniciar el navegador con opciones razonables y cerrarlo con `quit()` al finalizar.

## Diseño de casos de prueba (paso 4)

Cada comprobación registrada en consola e informes sigue la misma idea: **condición previa → acción → dato de entrada (si aplica) → resultado esperado**. Las funciones en `main.py` agrupan estos casos.

### CP-01 - Carga del blog

| Campo | Descripción |
|--------|-------------|
| Precondiciones | WebDriver iniciado; red disponible. |
| Pasos | 1) `driver.get(TARGET_URL)`. 2) Espera explícita a `body`. |
| Datos | `TARGET_URL` = `https://fraineralex.dev/blog`. |
| Resultado esperado | La URL actual contiene `fraineralex.dev/blog`. |

### CP-02 - Artículos y enlaces localizables

| Campo | Descripción |
|--------|-------------|
| Precondiciones | Página del blog cargada. |
| Pasos | Buscar `article`, `a`, `footer`. |
| Datos | Selectores: `article`, etiqueta `a`, etiqueta `footer`. |
| Resultado esperado | Al menos un artículo, varios enlaces y un pie presente. |

### CP-03 - Navegación desde un artículo

| Campo | Descripción |
|--------|-------------|
| Precondiciones | Listado de artículos visible. |
| Pasos | Hasta tres intentos: scroll al enlace, clic, comprobar título, `back()`, esperar artículos de nuevo. |
| Datos | Enlaces `article a`. |
| Resultado esperado | Al menos una navegación exitosa con título no vacío. |

### CP-04 - Scroll con teclas

| Campo | Descripción |
|--------|-------------|
| Precondiciones | Blog cargado. |
| Pasos | Enfocar `body`, enviar `Keys.END`, luego `Keys.HOME`. |
| Datos | Teclas Fin e Inicio. |
| Resultado esperado | Las acciones se ejecutan sin error (flujo de scroll por teclado). |

### CP-05 - Esperas explícitas sobre contenido principal

| Campo | Descripción |
|--------|-------------|
| Precondiciones | Blog cargado. |
| Pasos | `WebDriverWait` + `visibility_of_all_elements_located` en `article`; `presence_of_element_located` en `footer`. |
| Datos | Timeouts configurados en código (10–15 s según bloque). |
| Resultado esperado | Artículos visibles en número > 0; `footer` presente. |

### CP-06 - Pie de página interactivo

| Campo | Descripción |
|--------|-------------|
| Precondiciones | Blog cargado. |
| Pasos | Espera asociada a `.loading-section`; scroll al pie; esperar enlaces; comprobar clicables. |
| Datos | Selector `.loading-section`, `footer a`. |
| Resultado esperado | Enlaces en el pie presentes y en estado clickeable. |

### CP-07 - Comprobaciones vía JavaScript

| Campo | Descripción |
|--------|-------------|
| Precondiciones | Blog cargado. |
| Pasos | Scroll al final e inicio por JS; leer título y URL por script. |
| Datos | Scripts en `execute_script`. |
| Resultado esperado | Título contiene `Frainer`; URL contiene `fraineralex`. |

### CP-08 - Cookies y pestañas

| Campo | Descripción |
|--------|-------------|
| Precondiciones | Sesión iniciada en el blog. |
| Pasos | `get_cookies()`; abrir nueva ventana; ir a `https://example.com`; volver; cerrar la segunda ventana. |
| Datos | Dominio de ejemplo para la segunda pestaña. |
| Resultado esperado | Lista de cookies obtenida; dos ventanas y luego una; título de ejemplo reconocible. |

## Selenium WebDriver: apertura y cierre (paso 5)

- **Inicio:** `webdriver.Edge` con opciones (ventana maximizada, reducción de banderas de automatización obvia).  
- **Espera implícita:** `driver.implicitly_wait(5)` tras crear el driver.  
- **Cierre:** `driver.quit()` en `cleanup()`, llamado desde un `finally` para que el navegador se cierre aunque falle una prueba intermedia. Si el driver no llegó a crearse, no se invoca `quit()`.

## Implementación y aserciones (paso 6)

Cada verificación usa criterios booleanos (por ejemplo, subcadena en URL, recuento de elementos > 0) y se registra con `log_test(nombre, pasó, mensaje)`, que acumula el resultado para el resumen y los informes. Esto equivale a **aserciones comprobables** sobre el estado de la UI y del navegador.

## Esperas explícitas e implícitas (paso 7)

- **Implícita:** 5 segundos en todo el driver para localización de elementos.  
- **Explícitas:** `WebDriverWait` con `expected_conditions` (`presence_of_element_located`, `visibility_of_all_elements_located`, `element_to_be_clickable`, `invisibility_of_element_located`, etc.) en los bloques que dependen de carga o interactividad.

## Ejecución de pruebas (paso 8)

```bash
python main.py
```

Durante la ejecución se abre Edge, se recorren los escenarios y al final se imprime el resumen en consola.

## Informes de prueba (paso 9)

Tras cada ejecución se generan (carpeta `reports/`):

| Archivo | Formato | Uso |
|---------|---------|-----|
| `reports/selenium_report.html` | HTML | Informe legible en navegador: estado por caso, totales, marcas de tiempo UTC y duración. |
| `reports/junit_report.xml` | JUnit / testsuites | Integración con herramientas que consumen XML de pruebas (CI, visualizadores). |

Equivale a un informe nativo del marco de ejecución propio del script, en la línea de lo pedido en la guía (TestNG / ExtentReports en otros ecosistemas).

## Buenas prácticas y mantenibilidad (paso 10)

- Funciones de prueba **por comportamiento** (navegación, selectores, pestañas, etc.).  
- **Nombres** de casos claros en inglés en salida e informes para trazabilidad.  
- **Selectores** agrupados por bloque lógico; timeouts centralizados por función.  
- Manejo de errores en navegación por artículos con reintento controlado (`continue` ante fallo puntual).  
- Reinicio del diccionario de resultados al inicio de `main()` para ejecuciones repetidas.

## Documentación y réplica (paso 11)

Esta guía describe configuración, escenarios, casos, ejecución e informes. Con Python, Selenium, Edge y red, cualquier persona puede clonar o copiar la carpeta `sqa-activity-9`, instalar dependencias y ejecutar `python main.py`.

## Entrega final (paso 12)

Incluye:

- Código fuente (`main.py`, `requirements.txt`, este `README.md`).  
- Informes generados en `reports/` (ejecuta una vez antes de empaquetar si tu institución pide archivos concretos).  
- **Video:** grabación tuya mostrando la corrida y el comportamiento en el navegador (único pendiente explícito de tu parte).

## Estructura del proyecto

```
sqa-activity-9/
├── README.md
├── requirements.txt
├── main.py
└── reports/
    ├── .gitkeep
    ├── selenium_report.html    (generado al ejecutar)
    └── junit_report.xml        (generado al ejecutar)
```

## Referencia rápida del código

Las funciones principales en `main.py` son: `setup_driver`, `test_navigate_to_site`, `test_element_identification`, `test_click_and_navigation`, `test_send_keys`, `test_explicit_wait`, `test_dynamic_elements`, `test_javascript_execution`, `test_cookies`, `test_tabs`, `cleanup`, `print_summary`, `write_html_report`, `write_junit_report`.

---

**Identificación del trabajo:** Actividad 9 - Selenium - automatización sobre [https://fraineralex.dev/blog](https://fraineralex.dev/blog).
