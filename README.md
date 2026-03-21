# TechStore Pro - Backend Core

Backend de alto rendimiento construido con **NestJS**, diseñado bajo principios de Arquitectura Hexagonal y Clean Architecture.

## 🚀 Tecnologías y Arquitectura (Senior Upgrade 2026)

### 🏗️ Estructura de Persistencia Políglota e Integridad Híbrida
El sistema utiliza una estrategia de base de datos híbrida para maximizar eficiencia e integridad:
*   **PostgreSQL (TypeORM):** Fuente de verdad transaccional para **Órdenes** e **Inventario** (Garantía ACID).
*   **MongoDB (Mongoose):** Catálogo de **Productos** optimizado para lectura rápida y sincronización de stock asíncrona.
*   **Integridad Híbrida (Saga Choreography):** Sincronización automática de stock entre Postgres y Mongo mediante eventos de dominio (`EventEmitter2`) para asegurar consistencia eventual sin sacrificar rendimiento.

### 🛡️ Seguridad Avanzada y Gestión de Sesiones
*   **Refresh Tokens con Rotación:** Sistema de doble token (`access_token` de 15m y `refresh_token` de 7d) persistido en MongoDB con rotación automática para máxima seguridad de sesión.
*   **MFA (2FA) Completo:** Autenticación de dos factores integrada en el flujo de login. Soporta TOTP (Google Authenticator/Authy) mediante `otplib`.
*   **Validación de Entorno Estricta:** Implementación de **Zod** para validación de variables de entorno al arranque (Fail-fast strategy).
*   **Filtro de Excepciones Global:** Estandarización de todas las respuestas de error del sistema para una integración fluida con el frontend.

### 💎 Calidad de Código y Modernización
*   **API Future-Proof:** Uso de patrones modernos de Mongoose (`returnDocument: 'after'`) para evitar warnings de obsolescencia.
*   **Scripts de Administración:** Incluye herramientas CLI personalizadas (`npm run promote-admin`) para gestión segura de roles de usuario.

### ⚡ Rendimiento y Escalabilidad
*   **Distributed Locking:** Sistema de bloqueos por producto para evitar condiciones de carrera en el stock durante compras masivas.
*   **Caché Inteligente:** Capa de caché con `CacheManager` para acelerar el catálogo.
*   **Event-Driven Search:** Sincronización automática con motores de búsqueda mediante eventos de dominio.

### 💳 Integración de Pagos
*   **Stripe SDK:** Flujo completo de `PaymentIntents`.
*   **Webhooks:** Procesamiento asíncrono y seguro de confirmaciones de pago con validación de firma.

## 🛠️ Instalación y Configuración

1.  `npm install`
2.  Configurar `.env` basado en `.env.example` (Validado por Zod).
3.  `npm run start:dev`

## 📖 Documentación de API
Disponible en `/api-docs` una vez que el servidor esté corriendo (Swagger/OpenAPI).
