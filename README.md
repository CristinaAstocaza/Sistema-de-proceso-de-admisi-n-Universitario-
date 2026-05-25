# Sistema de Proceso de Admisión Universitario

Sistema web desarrollado para automatizar el procesamiento de exámenes OMR en procesos de admisión universitaria.

---

## Características principales

- Gestión de procesos de admisión
- Carga de archivos OMR (`IDENTIFI`, `RESPUEST`, `CLAVES`)
- Soporte para archivos `.DBF`
- Procesamiento automático de exámenes
- Generación de mérito y ranking
- Control de incidencias y observaciones
- Exportación de resultados

---

## 📄 Tecnologías utilizadas

### Backend
- Java
- Spring Boot
- Spring Security
- JPA / Hibernate
- PostgreSQL

### Frontend
- React
- Vite
- TailwindCSS
- Axios

---

## Arquitectura

El sistema utiliza una arquitectura MVC adaptada a servicios REST y organizada por capas:

- Controllers
- Services
- Repositories
- Entities / DTOs

---

## 🚀 Ejecución del proyecto

### Backend

```bash
cd backend
./mvnw spring-boot:run
```
### Frontend

```bash
cd frontend
npm install
npm run dev
```
### Base de datos

Configurar las credenciales PostgreSQL en:
application.properties


👩‍💻 Autor
Candy Cristina Astocaza O.
