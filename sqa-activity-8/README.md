# Proyecto de Automatización con Selenium

Este proyecto demuestra los conceptos fundamentales de Selenium WebDriver para la automatización de pruebas web utilizando Python. El proyecto incluye pruebas automatizadas que verifican el funcionamiento correcto de cada característica.

## 1. Introducción a Selenium

### Qué es Selenium
Selenium es un conjunto de herramientas de código abierto diseñadas para automatizar navegadores web. Permite a los desarrolladores y testers crear scripts que pueden interactuar con páginas web de manera similar a como lo haría un usuario real.

### Importancia en automatización
Selenium es fundamental en el campo de la automatización de pruebas porque:
- Permite la ejecución de pruebas repetitivas de manera consistente
- Reduce el tiempo necesario para realizar pruebas de regresión
- Facilita la detección temprana de errores
- Soporta múltiples lenguajes de programación
- Es compatible con diversos navegadores y plataformas

### Arquitectura de Selenium WebDriver
La arquitectura de Selenium WebDriver consiste en:
1. **Lenguaje de programación (Python)**: El script de prueba escrito por el usuario
2. **Protocolo WebDriver**: Una interfaz estándar que permite la comunicación entre el lenguaje y el navegador
3. **Navegador (Edge/Chrome)**: El navegador que ejecuta las acciones automatizadas
4. **WebDriver**: Un ejecutable que actúa como puente entre Selenium y el navegador

## 2. Configuración del entorno

### Requisitos previos
- Python 3.14 (o superior)
- Navegador Microsoft Edge instalado (o Chrome)
- uv (gestor de paquetes de Python)

### Instalación de Selenium
Con las dependencias del proyecto:

```bash
uv pip install -r requirements.txt
```

### Cómo ejecutar el proyecto
Simplemente ejecuta:

```bash
python main.py
```

O si usas uv:

```bash
uv run python main.py
```

Asegúrate de tener Edge (o Chrome) instalado en tu sistema.

## 3. Estructura del Proyecto

```
selenium-assignment/
├── README.md         # Esta documentación
├── requirements.txt # Dependencias de Python
└── main.py          # Script principal de automatización
```

## 4. Pruebas Implementadas

El script `main.py` incluye 23 pruebas automatizadas que verifican:

### 4.1 Configuración del WebDriver
- Inicialización del navegador Edge/Chrome
- Configuración de opciones de automatización

### 4.2 Navegación
- Apertura del sitio web https://fraineralex.dev/blog
- Verificación de URL cargada

### 4.3 Identificación de Elementos
- **CSS Selector**: Localización de artículos del blog
- **Tag Name**: Localización de enlaces y footer

### 4.4 Clicks y Navegación
- Clic en enlaces de artículos
- Navegación entre páginas del blog
- Uso de `driver.back()` para retornar

### 4.5 Send Keys
- Uso de `Keys.END` para desplazamiento hacia abajo
- Uso de `Keys.HOME` para desplazamiento hacia arriba

### 4.6 Esperas Explícitas
- Espera hasta que los artículos sean visibles
- Espera hasta que el footer esté presente en el DOM

### 4.7 Elementos Dinámicos
- Espera a que desaparezca la sección de carga
- Espera a que los enlaces del footer sean clicables
- Verificación de contenido cargado dinámicamente

### 4.8 Ejecución de JavaScript
- Scroll hasta el final de la página
- Scroll hasta el inicio de la página
- Obtención del título del documento
- Obtención de la URL actual

### 4.9 Manejo de Cookies
- Lectura de cookies del sitio web

### 4.10 Manejo de Pestañas
- Apertura de nuevas pestañas
- Navegación en pestañas nuevas
- Cambio entre pestañas
- Cierre de pestañas

## 5. Resultados de las Pruebas

Al ejecutar `python main.py`, el script muestra:

```
==================================================
TEST SUMMARY
==================================================
Total Tests: 23
Passed: 23
Failed: 0
Pass Rate: 100.0%

Detailed Results:
  ✓ WebDriver Setup - Chrome/Edge initialized
  ✓ Navigate to URL - Expected: fraineralex.dev/blog
  ✓ CSS Selector - Find articles - Found 5 articles
  ✓ Tag Name - Find anchors - Found 18 anchor tags
  ✓ Tag Name - Find footer - Found footer: True
  ✓ Click Navigation - Successfully navigated to 3/3 pages
  ✓ send_keys - Scroll to bottom - Scrolled using END key
  ✓ send_keys - Scroll to top - Scrolled using HOME key
  ✓ Explicit Wait - Articles visible - Found 5 visible articles
  ✓ Explicit Wait - Footer present - Footer present in DOM
  ✓ Dynamic - Loading section gone - Loading section disappeared
  ✓ Dynamic - Footer links loaded - Found 6 footer links
  ✓ Dynamic - Links clickable - Footer links are clickable
  ✓ JS Execution - Scroll to bottom - Scrolled using JavaScript
  ✓ JS Execution - Scroll to top - Scrolled back to top
  ✓ JS Execution - Get title - Title: Frainer's Blog
  ✓ JS Execution - Get URL - URL: https://www.fraineralex.dev/blog
  ✓ Cookies - Read cookies - Found 0 cookies
  ✓ Tabs - Open new tab - Total windows: 2
  ✓ Tabs - Navigate in new tab - New tab title: Example Domain
  ✓ Tabs - Switch back - Returned to original tab
  ✓ Tabs - Close tab - Windows remaining: 1
  ✓ Browser Cleanup - Browser closed successfully

==================================================
ALL TESTS PASSED!
==================================================
```

Cada prueba muestra:
- **[PASS]**: Prueba exitosa
- **[FAIL]**: Prueba fallida
- Descripción de lo que se verificó

## 6. Código del Proyecto

### requirements.txt
```
selenium
```

### main.py
El script principal contiene:
- Configuración del WebDriver
- 10 funciones de prueba independientes
- Sistema de registro de resultados
- Resumen final de pruebas

## 7. Explicación del Código para el Profesor

### Funciones Principales

1. **setup_driver()**: Configura el navegador Edge con opciones de automatización.

2. **test_navigate_to_site()**: Navega al sitio y verifica que la URL sea correcta.

3. **test_element_identification()**: Demuestra diferentes estrategias para encontrar elementos:
   - CSS Selector: `driver.find_elements(By.CSS_SELECTOR, "article")`
   - Tag Name: `driver.find_elements(By.TAG_NAME, "a")`

4. **test_click_and_navigation()**: Clic en enlaces de artículos y navegación usando `driver.back()`.

5. **test_send_keys()**: Usa `Keys.END` y `Keys.HOME` para hacer scroll.

6. **test_explicit_wait()**: Usa `WebDriverWait` con `expected_conditions` para esperar elementos.

7. **test_dynamic_elements()**: Espera a que desaparezca el indicador de carga y los enlaces sean clicables.

8. **test_javascript_execution()**: Ejecuta JavaScript directamente:
   ```python
   driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
   ```

9. **test_cookies()**: Lee cookies del navegador:
   ```python
   cookies = driver.get_cookies()
   ```

10. **test_tabs()**: Maneja múltiples pestañas:
    - `driver.execute_script("window.open('');")`
    - `driver.switch_to.window(handle)`
    - `driver.close()`

### Sistema de Pruebas

Cada prueba usa la función `log_test()` que:
- Registra si la prueba pasó o falló
- Muestra un mensaje descriptivo
- Acumula resultados para el resumen final

## 8. Cómo Ejecutar el Proyecto

### Paso 1: Instalar dependencias
```bash
uv pip install -r requirements.txt
```

### Paso 2: Ejecutar las pruebas
```bash
python main.py
```

### Paso 3: Observar los resultados
El script mostrará cada prueba con su resultado (PASS/FAIL) y un resumen al final.

## 9. Características Avanzadas Demonstradas

### Page Object Model (Conceptual)
Aunque no se implementó completamente, el código sigue principios de POM:
- Funciones organizadas por funcionalidad
- Selectores centralizados
- Código reutilizable

### Logging
El proyecto usa el módulo `logging` de Python para registrar cada paso de la automatización.

### Manejo de Errores
El código incluye try-except para manejar errores gracefully y continuar con las demás pruebas.

---

## Notas Adicionales

- El proyecto usa **Edge** como navegador (puede cambiarse a Chrome fácilmente)
- El sitio objetivo es **https://fraineralex.dev/blog**
- Todas las pruebas están diseñadas para ejecutarse de forma independiente
- El tiempo de ejecución aproximado es de 1-2 minutos
