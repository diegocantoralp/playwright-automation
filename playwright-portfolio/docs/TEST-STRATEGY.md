### Continuous Integration
Cada *push* a `main` dispara el workflow `ci.yml` que:
1. Instala dependencias y navegadores.
2. Ejecuta la suite marcada como `@smoke` para validar la salud del sistema.
3. Genera artefactos HTML con resultados de Playwright.
