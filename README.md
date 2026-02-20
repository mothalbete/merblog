# MERBLOG

MERBLOG es una aplicación web donde los usuarios pueden crear publicaciones, comentar, dar likes y seguir a otros usuarios. Incluye un dashboard con filtros, un sistema de perfiles públicos y un diseño estilo vaporwave.

## Tecnologías

- Node.js + Express
- PostgreSQL
- Prisma ORM
- EJS
- Multer (subida de imágenes)
- Express-session

## Instalación

1. Clonar el repositorio:

   git clone <url>
   cd merblog

2. Instalar dependencias:

   npm install

3. Crear archivo .env:

   DATABASE_URL="postgresql://usuario:password@host:port/dbname"
   SESSION_SECRET="loquesea"
   PORT=5000

4. Generar migraciones y crear la base de datos:

   npx prisma migrate dev --name init

5. Generar el cliente Prisma:

   npx prisma generate

6. Iniciar el servidor:

   npm start

## Base de datos

El esquema completo está en:

/prisma/schema.prisma

Incluye:
- usuarios
- publicaciones
- comentarios
- likes
- seguidores
- etiquetas

## Funcionalidades principales

- Crear, editar y eliminar publicaciones
- Subir imágenes
- Dar y quitar likes
- Comentar publicaciones
- Seguir y dejar de seguir usuarios
- Dashboard con filtros por fecha y etiquetas
- Perfil público de cada usuario
- Modal dinámico para ver publicaciones

## Estructura básica

/controllers  
/lib
/middleware  
/prisma  
/public  
/routes  
/views 
index.js
test.js (comprobación de conexión con la bd) 

## Autora

Proyecto desarrollado por mothalbete.
