# Playwright Automation Portfolio

Repositorio de **pruebas automatizadas con Playwright** siguiendo la **arquitectura Page Object Model (POM)**.  
El objetivo es demostrar dominio en automatización progresiva (commits diarios) y buenas prácticas CI/CD.

## Tecnologías
- [Playwright](https://playwright.dev/)
- TypeScript
- GitHub Actions
- ESLint / Prettier

## Arquitectura del Proyecto
El proyecto adopta **POM (Page Object Model)**:
- Separación clara entre **lógica de prueba** y **elementos de interfaz**.
- Mejora la mantenibilidad y reutilización del código.
- Facilita agregar nuevos flujos o pantallas sin romper los existentes.

## Ejecución
```bash
# Instalar dependencias
npm install

# Ejecutar pruebas
npx playwright test

# Ver reportes
npx playwright show-report
