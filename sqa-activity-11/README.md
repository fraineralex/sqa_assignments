# Actividad 11 - Automatizacion de Pruebas con Appium para una Aplicacion Movil

## Introduccion

La presente practica corresponde a la Actividad 11 de la asignatura Aseguramiento de la Calidad del Software. En esta actividad se desarrollo un proyecto de automatizacion de pruebas moviles utilizando Appium como herramienta principal, junto con WebdriverIO, Mocha, Node.js y TypeScript.

El trabajo realizado permite comprender el flujo general de una automatizacion movil sobre Android, cubriendo la preparacion del entorno, la configuracion del proyecto, la identificacion de elementos de la interfaz, la escritura de casos de prueba, la ejecucion de los mismos y la documentacion de los resultados obtenidos.

## Objetivo

Introducir el proceso de automatizacion de pruebas para aplicaciones moviles utilizando Appium, configurando un proyecto funcional de pruebas, definiendo casos automatizados y documentando cada una de las etapas requeridas por la practica.

## Herramientas y tecnologias utilizadas

- `Appium` como herramienta de automatizacion movil.
- `Node.js` como entorno de ejecucion.
- `TypeScript` como lenguaje para la implementacion del proyecto.
- `WebdriverIO` como cliente para interactuar con Appium.
- `Mocha` como framework de pruebas.
- `Visual Studio Code` como entorno de desarrollo.
- `Android Studio` para la gestion del emulador Android.

## Aplicacion movil seleccionada

La aplicacion elegida para esta practica fue `Sauce Labs My Demo App` para Android. Esta aplicacion de demostracion es apropiada para actividades de automatizacion porque contiene funcionalidades comunes y faciles de validar, tales como login, navegacion por menu, visualizacion de productos y gestion de carrito.

Las funcionalidades cubiertas por los casos de prueba implementados fueron:

- apertura del menu principal
- acceso al formulario de autenticacion
- ingreso de usuario y contrasena
- validacion de credenciales invalidas
- agregar un producto al carrito
- navegar a la pantalla del carrito

## Estructura del proyecto

```text
sqa-activity-11/
├── config/
│   └── wdio.conf.ts
├── docs/
│   └── checklist-evidencias.md
├── scripts/
├── test/
│   ├── pageobjects/
│   │   ├── login.page.ts
│   │   └── products.page.ts
│   └── specs/
│       ├── cart.spec.ts
│       └── login.spec.ts
├── utils/
│   └── test-data.ts
├── .gitignore
├── package.json
├── README.md
└── tsconfig.json
```

## Desarrollo de la practica

### 1. Preparacion del entorno

En esta primera etapa se preparo el entorno de trabajo instalando las dependencias necesarias para el proyecto y verificando la configuracion del compilador TypeScript.

Comandos utilizados:

```bash
bun install
bun run typecheck
```

Adicionalmente se conto con Android Studio instalado para la gestion del emulador Android, junto con Appium configurado como servidor de automatizacion.

### 2. Seleccion de la aplicacion

Se eligio `Sauce Labs My Demo App` como aplicacion bajo prueba por tratarse de una app Android ampliamente utilizada en entornos de practica de automatizacion. La misma ofrece una interfaz suficiente para probar acciones relevantes como autenticacion, interaccion con productos y navegacion interna.

### 3. Configuracion del proyecto

Se creo un proyecto nuevo utilizando `Node.js` y `TypeScript`, configurando las dependencias necesarias para trabajar con Appium y WebdriverIO. Tambien se definio la estructura del proyecto en carpetas separadas para configuracion, pruebas, page objects y utilidades.

Archivos configurados:

- `package.json`
- `tsconfig.json`
- `config/wdio.conf.ts`
- `test/specs/login.spec.ts`
- `test/specs/cart.spec.ts`
- `test/pageobjects/login.page.ts`
- `test/pageobjects/products.page.ts`

Los scripts principales del proyecto quedaron definidos para iniciar Appium, ejecutar pruebas y validar la compilacion.

### 4. Configuracion de Appium

Una vez creado el proyecto, se configuro Appium para conectarse al emulador Android. Esta configuracion se encuentra en el archivo `config/wdio.conf.ts`, donde se definieron las capacidades deseadas del dispositivo.

Entre las capacidades utilizadas se encuentran:

- `platformName: Android`
- `automationName: UiAutomator2`
- `deviceName: Pixel_7_API_34`
- `platformVersion: 14.0`
- `appPackage` de la aplicacion seleccionada
- `appActivity` de la aplicacion seleccionada

Tambien se levanto el servidor Appium para permitir la conexion desde WebdriverIO.

Comandos utilizados:

```bash
bun run appium:doctor
bun run appium:start
```

### 5. Identificacion de elementos

Con la aplicacion ejecutandose en el emulador, se utilizaron las herramientas de inspeccion de Appium para identificar los elementos de la interfaz de usuario necesarios para automatizar los escenarios seleccionados.

Elementos identificados:

- boton para abrir el menu
- opcion de login
- campo de nombre de usuario
- campo de contrasena
- boton de login
- boton de agregar producto al carrito
- acceso al carrito

Estos localizadores fueron posteriormente utilizados dentro de los archivos `login.page.ts` y `products.page.ts`.

### 6. Escritura de casos de prueba

Luego de identificar los elementos, se desarrollaron los casos de prueba automatizados. Para una mejor organizacion del proyecto se implemento el patron `Page Object Model`, separando las acciones de la interfaz de los escenarios de prueba.

Casos de prueba desarrollados:

1. validar intento de login con credenciales invalidas
2. completar el formulario de login
3. agregar un producto al carrito
4. navegar hacia la pantalla del carrito

Archivos principales de esta etapa:

- `test/specs/login.spec.ts`
- `test/specs/cart.spec.ts`
- `test/pageobjects/login.page.ts`
- `test/pageobjects/products.page.ts`

### 7. Ejecucion de pruebas

Una vez finalizados los casos de prueba, se ejecuto la automatizacion mediante WebdriverIO utilizando la configuracion definida en el proyecto.

Comando utilizado:

```bash
bun run test
```

Durante esta etapa se verifico la interaccion de la automatizacion con la aplicacion movil, validando que las acciones previstas se ejecutaran correctamente sobre el emulador Android.

### 8. Captura de resultados

Finalizada la corrida de pruebas, se analizaron los resultados de ejecucion. La salida permitio comprobar el total de pruebas ejecutadas, las pruebas aprobadas y el estado general de la automatizacion.

Resultados obtenidos:

- suites ejecutadas correctamente
- pruebas completadas exitosamente
- validaciones correspondientes al flujo de login y carrito
- confirmacion visual de que no hubo errores bloqueantes durante la corrida

Esta etapa fue importante para interpretar el comportamiento del proyecto y confirmar que las interacciones automatizadas se realizaron de acuerdo con lo esperado.

### 9. Mejoras continuas

Como parte del analisis posterior, se identificaron oportunidades de mejora para continuar evolucionando la solucion de pruebas:

- agregar escenarios de checkout
- validar mensajes de error mas detallados
- incluir pruebas de logout
- integrar reportes avanzados como Allure
- ejecutar las pruebas desde un pipeline CI/CD
- ampliar la cobertura funcional de la aplicacion

Estas mejoras permitirian incrementar la robustez del proyecto y hacerlo mas cercano a un entorno profesional de automatizacion.

### 10. Documentacion

La documentacion del proyecto fue organizada de forma que cada fase de la practica quedara claramente evidenciada. El archivo `README.md` funciona como base del informe tecnico, describiendo los pasos realizados, la configuracion del entorno, los casos de prueba y los resultados obtenidos.

Tambien se incluyo el archivo `docs/checklist-evidencias.md`, el cual sirve como apoyo para organizar las capturas y facilitar la construccion del documento final de entrega.

Elementos documentados:

- preparacion del entorno
- seleccion de la aplicacion
- configuracion del proyecto
- configuracion de Appium
- identificacion de elementos
- escritura de pruebas
- ejecucion de pruebas
- resultados obtenidos
- oportunidades de mejora

## Comandos utilizados durante la actividad

```bash
bun install
bun run typecheck
bun run appium:doctor
bun run appium:start
bun run test
```

## Explicacion breve de archivos importantes

- `package.json`: contiene dependencias y scripts del proyecto.
- `tsconfig.json`: define la configuracion de TypeScript.
- `config/wdio.conf.ts`: contiene la configuracion principal de WebdriverIO y Appium.
- `test/specs/login.spec.ts`: agrupa pruebas relacionadas con autenticacion.
- `test/specs/cart.spec.ts`: agrupa pruebas relacionadas con carrito.
- `test/pageobjects/login.page.ts`: concentra la logica de interaccion con login.
- `test/pageobjects/products.page.ts`: concentra la logica de interaccion con productos y carrito.
- `utils/test-data.ts`: centraliza datos de prueba.

## Conclusion

Esta practica permitio aplicar los conceptos fundamentales de la automatizacion de pruebas moviles con Appium. A traves de la configuracion del proyecto, la definicion de localizadores, la implementacion de page objects y la escritura de pruebas funcionales, se logro construir una base organizada para automatizar escenarios sobre Android.

Ademas, la actividad ayudo a comprender la importancia de preparar correctamente el entorno, identificar elementos de forma precisa, estructurar bien los casos de prueba y documentar los resultados obtenidos. Todo esto constituye una base importante para futuros trabajos de automatizacion en entornos mas amplios y reales.

## Recomendacion para el documento Word

Para el documento final de entrega puede mantenerse esta misma estructura:

1. Introduccion
2. Objetivo
3. Herramientas y tecnologias utilizadas
4. Aplicacion movil seleccionada
5. Estructura del proyecto
6. Desarrollo de la practica
7. Conclusion
