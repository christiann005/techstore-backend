# TechStore Pro - Backend Core

Backend de alto rendimiento construido con **NestJS**, diseñado bajo principios de Arquitectura Hexagonal y Clean Architecture.

## 🚀 Tecnologías y Arquitectura

### 🏗️ Estructura de Persistencia Políglota
El sistema utiliza una estrategia de base de datos híbrida para maximizar eficiencia e integridad:
*   **PostgreSQL (TypeORM):** Manejo transaccional crítico para **Órdenes** e **Inventario** (Garantía ACID).
*   **MongoDB (Mongoose):** Catálogo de **Productos** y perfiles de **Usuarios** para flexibilidad de esquemas.

### 🛡️ Seguridad Avanzada
*   **MFA (2FA):** Autenticación de dos factores implementada con TOTP (Google Authenticator/Authy).
*   **Rate Limiting:** Protección contra fuerza bruta con `Throttler`.
*   **JWT & Passport:** Gestión de sesiones segura con cookies e interceptores.

### ⚡ Rendimiento y Escalabilidad
*   **Distributed Locking:** Sistema de bloqueos por producto para evitar condiciones de carrera en el stock durante compras masivas.
*   **Caché Avanzada:** Capa de caché con `CacheManager` para acelerar el catálogo.
*   **Event-Driven Search:** Sincronización automática con motores de búsqueda (Meilisearch/Algolia) mediante eventos de dominio.

### 💳 Integración de Pagos
*   **Stripe SDK:** Flujo completo de `PaymentIntents`.
*   **Webhooks:** Procesamiento asíncrono y seguro de confirmaciones de pago con validación de firma.

## 🛠️ Instalación y Configuración

1.  `npm install`
2.  Configurar `.env` basado en `.env.example`.
3.  `npm run start:dev`

## 📖 Documentación de API
Disponible en `/api-docs` una vez que el servidor esté corriendo (Swagger/OpenAPI).
