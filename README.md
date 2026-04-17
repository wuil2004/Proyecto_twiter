# 🐦 Micro-Twitter Clone | Arquitectura de Microservicios

¡Bienvenido a Micro-Twitter! Este es un proyecto Full-Stack diseñado para replicar las funcionalidades básicas de Twitter (X) utilizando una **Arquitectura de Microservicios Orientada a Eventos**. 

El objetivo principal de este proyecto es demostrar la implementación de sistemas distribuidos, alta disponibilidad, balanceo de cargas, consistencia eventual y contenerización.

---

## 🏗️ Arquitectura y Tecnologías

El sistema está dividido en múltiples servicios independientes que se comunican entre sí de forma asíncrona y a través de un API Gateway.

### Backend (Microservicios en Node.js)
* **ms-users:** Gestión de registro, autenticación de usuarios y generación de JWT.
* **ms-posts:** Creación y visualización de tuits en el Timeline.
* **ms-likes:** Sistema de "Me gusta" interactivo.
* **ms-buscar:** Motor de búsqueda para encontrar usuarios y tuits específicos.

### Infraestructura & Bases de Datos
* **Nginx (API Gateway):** Actúa como proxy inverso y enrutador de peticiones del cliente al microservicio correcto.
* **RabbitMQ:** Bus de mensajes para la comunicación asíncrona entre microservicios (Ej. Cuando se da un "Like", `ms-likes` avisa a `ms-posts` mediante eventos, logrando consistencia eventual).
* **MongoDB (Replica Sets):** Bases de datos NoSQL independientes para cada microservicio, configuradas en clústeres de alta disponibilidad.
* **Docker & Docker Compose:** Contenerización de todos los servicios e infraestructura para un despliegue unificado.

### Frontend
* **React + Vite:** Interfaz de usuario dinámica y rápida.
* **React Router DOM:** Navegación fluida entre vistas (Login, Muro).
* **Axios:** Cliente HTTP para el consumo seguro de APIs.
* **CSS Puro + Animaciones:** Diseño premium con efecto de panel deslizante para Autenticación.
* **React Hot Toast:** Sistema de notificaciones modernas y no intrusivas.

---

## ✨ Características Principales

1. **Autenticación Segura y Fluida:** Registro e inicio de sesión protegidos con JSON Web Tokens (JWT). Incluye experiencia de "Auto-Login" tras un registro exitoso.
2. **Timeline Dinámico:** Visualización de tuits ordenados cronológicamente con formato de tiempo relativo nativo (ej. "hace 5 min").
3. **Publicación de Tuits:** Creación de nuevos mensajes en tiempo real.
4. **Sistema de Likes (Optimistic UI):** Interfaz que responde instantáneamente al dar "Me gusta", ocultando la latencia mientras RabbitMQ sincroniza los datos en segundo plano.
5. **Motor de Búsqueda Robusto:** Búsqueda combinada que indexa tanto el contenido de los tuits como los nombres de usuario (`@username`), integrándose limpiamente en el muro principal.

---

## 📋 Requisitos del Sistema

Antes de comenzar, asegúrate de tener instalado en tu entorno local:
* **Docker Desktop** (incluye Docker Compose).
* **Node.js v18+** (para la instalación de dependencias del frontend).
* **Git**.

---

## 🛠️ Guía de Instalación y Configuración

Sigue estos pasos en orden para levantar el ecosistema completo:

### 1. Clonar el repositorio
```bash
git clone [https://github.com/TU_USUARIO/micro-twitter.git](https://github.com/TU_USUARIO/micro-twitter.git)
cd micro-twitter
