# ⚙️ TechStore Pro - Backend (NestJS + TypeScript) 🇨🇴

Este es el núcleo de **TechStore Pro**, un backend de grado empresarial diseñado bajo una arquitectura modular, robusta y segura.

## 🛡️ Blindaje de Seguridad (OWASP)
- **Cookies HttpOnly:** Sistema de autenticación JWT guardado en cookies seguras (JS no puede leerlas).
- **Throttling (Rate Limit):** Límite global de 100 req/min y límite estricto de 5 req/min en login/register.
- **Validación DTO:** Validación automática de datos entrantes con `class-validator`.
- **CORS con Credenciales:** Configurado para permitir comunicación segura con el dominio oficial.

## 🏗️ Arquitectura e Infraestructura
- **NestJS:** Framework modular con inyección de dependencias.
- **Estrategia Dual DB:**
  - **MySQL (TypeORM):** Usuarios, Transacciones, Órdenes.
  - **MongoDB (Mongoose):** Catálogo de Productos y Reseñas.
- **Servicios Integrados:**
  - **Stripe:** Pasarela de pago segura.
  - **Mailer Service:** Envío de OTP (One Time Passwords) vía Gmail/SMTP.

## 🚀 Cómo Ejecutar (Standalone)
1. `npm install`
2. Configura tu `.env` (usa `.env.example`).
3. `npm run build` (Para compilar TypeScript).
4. `npm run start:dev` (Ejecución en desarrollo).

## 📄 Documentación de API (Swagger)
El sistema cuenta con una documentación completa de sus endpoints, incluyendo esquemas de datos y autenticación Bearer.
- **URL Local:** `http://localhost:4000/api-docs`
- **Recomendado:** Usa Swagger para probar los flujos de `auth`, `products`, e `inventory`.

## 📸 Seed del Catálogo
Puedes poblar el sistema con productos reales de hardware (NVIDIA, Apple, etc.) haciendo un **POST** a:
`http://localhost:4000/products/seed` (o directamente desde Swagger).
