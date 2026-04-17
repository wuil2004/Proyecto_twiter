# 🐦 Micro-Twitter Clone | Arquitectura de Microservicios

¡Bienvenido a Micro-Twitter! Este es un proyecto Full-Stack diseñado para replicar las funcionalidades básicas de Twitter (X) utilizando una **Arquitectura de Microservicios Orientada a Eventos**. 

El objetivo principal de este proyecto es demostrar la implementación de sistemas distribuidos, balanceo de cargas, consistencia eventual y contenedores.

---

## 🏗️ Arquitectura y Tecnologías

El sistema está dividido en múltiples servicios independientes que se comunican entre sí de forma asíncrona y a través de un API Gateway.

### Backend (Microservicios en Node.js)
* **ms-users:** Gestión de registro, autenticación de usuarios y generación de JWT.
* **ms-posts:** Creación y visualización de tuits en el Timeline.
* **ms-likes:** Sistema de "Me gusta" interactivo.
* **ms-buscar:** Motor de búsqueda para encontrar usuarios y tuits específicos.

### Infraestructura & Bases de Datos
* **Nginx (API Gateway):** Actúa como proxy inverso y balanceador de carga, enrutando las peticiones del cliente al microservicio correcto.
* **RabbitMQ:** Bus de mensajes para la comunicación asíncrona entre microservicios (Ej. Cuando se da un "Like", `ms-likes` avisa a `ms-posts` mediante eventos).
* **MongoDB:** Bases de datos NoSQL independientes para cada microservicio.
* **Docker & Docker Compose:** Contenerización de todos los servicios para despliegue con un solo comando.

### Frontend
* **React + Vite:** Interfaz de usuario dinámica y rápida.
* **React Router DOM:** Navegación entre vistas (Login, Muro).
* **Axios:** Cliente HTTP para consumir el API Gateway.
* **CSS Puro + Animaciones:** Diseño moderno con efecto de panel deslizante para el Login/Registro.
* **React Hot Toast:** Sistema de notificaciones elegante.

---

## ✨ Características Principales

1. **Autenticación Segura:** Registro e inicio de sesión protegidos con JSON Web Tokens (JWT). Experiencia de Auto-Login post-registro.
2. **Timeline en Tiempo Real:** Visualización de tuits ordenados cronológicamente con formato de tiempo relativo (ej. "hace 5 min").
3. **Publicación de Tuits:** Creación de nuevos mensajes limitados a 280 caracteres.
4. **Sistema de Likes (Optimistic UI):** Interfaz que responde instantáneamente al dar "Me gusta", mientras RabbitMQ procesa la consistencia eventual en segundo plano.
5. **Motor de Búsqueda:** Búsqueda combinada de contenido de tuits y nombres de usuario (`@username`).

---

## 🚀 Requisitos Previos

Para correr este proyecto en tu entorno local, necesitas tener instalado:
* [Docker](https://www.docker.com/) y Docker Compose.
* [Node.js](https://nodejs.org/) (Para desarrollo local del frontend, opcional si corre en contenedor).
* Git.

---

## 🛠️ Instalación y Ejecución

Sigue estos pasos para levantar toda la infraestructura en tu máquina:

**1. Clonar el repositorio**
```bash
git clone [https://github.com/wuil2004/Proyecto_twiter.git]
cd micro-twitter
