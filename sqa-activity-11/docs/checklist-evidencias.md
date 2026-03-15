# Checklist de evidencias

Usa esta lista para organizar tus screenshots dentro del documento Word final.

## Orden sugerido de capturas

1. `bun install`
2. `bun run typecheck`
3. `bun run appium:doctor`
4. Android Studio con el emulador Android iniciado
5. `bun run appium:start`
6. Appium Inspector mostrando elementos detectados
7. Contenido de `config/wdio.conf.ts`
8. Contenido de `test/specs/login.spec.ts`
9. Contenido de `test/specs/cart.spec.ts`
10. Contenido de `test/pageobjects/login.page.ts`
11. Contenido de `test/pageobjects/products.page.ts`
12. `bun run test`
13. Resumen final de las pruebas exitosas

## Nombre sugerido para cada screenshot

- `01-bun-install.png`
- `02-typecheck.png`
- `03-appium-doctor.png`
- `04-android-studio-emulator.png`
- `05-appium-server.png`
- `06-appium-inspector.png`
- `07-wdio-config.png`
- `08-login-spec.png`
- `09-cart-spec.png`
- `10-login-pageobject.png`
- `11-products-pageobject.png`
- `12-test-execution.png`
- `13-test-summary.png`

## Ubicacion sugerida en el documento Word

- Preparacion del entorno: `bun install`, `bun run typecheck`
- Configuracion de Appium: `bun run appium:doctor`, Appium Server, emulador Android
- Identificacion de elementos: Appium Inspector
- Configuracion del proyecto: `config/wdio.conf.ts`
- Casos de prueba: archivos `test/specs` y `test/pageobjects`
- Ejecucion y resultados: `bun run test`

## Texto breve de conclusion sugerida

> La practica permitio implementar un proyecto de automatizacion movil con Appium, WebdriverIO, Mocha y TypeScript. Se configuro el entorno de trabajo, se identificaron elementos de la interfaz, se desarrollaron casos de prueba y se documentaron los resultados obtenidos durante la ejecucion sobre Android.
