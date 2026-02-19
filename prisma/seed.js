const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {

    console.log("🌱 Generando datos de prueba...");

    // ============================
    // 1. CREAR USUARIOS
    // ============================

    const usuarios = [];

    for (let i = 1; i <= 10; i++) {
        const user = await prisma.usuarios.create({
            data: {
                nombre: `usuario${i}`,
                email: `usuario${i}@test.com`,
                contraseña: "hashedpassword123",
                biografia: `Esta es la biografía del usuario ${i}.`,
                nick: `user${i}`
            }
        });
        usuarios.push(user);
    }

    console.log("✔ Usuarios creados");

    // ============================
    // 2. CREAR PUBLICACIONES
    // ============================

    const publicaciones = [];

    for (let i = 1; i <= 20; i++) {
        const autor = usuarios[Math.floor(Math.random() * usuarios.length)];

        const pub = await prisma.publicacion.create({
            data: {
                id_usuario: autor.id_usuario,
                titulo: `Publicación de prueba ${i}`,
                contenido: `Este es el contenido de la publicación número ${i}.`,
                estado: Math.random() > 0.2 ? "publicado" : "borrador",
                numero_visitas: Math.floor(Math.random() * 500),
                imagen: `https://picsum.photos/seed/pub${i}/600/400`
            }
        });

        publicaciones.push(pub);
    }

    console.log("✔ Publicaciones creadas");

    // ============================
    // 3. CREAR ETIQUETAS
    // ============================

    const etiquetas = ["arte", "música", "viajes", "tecnología", "cocina", "cine", "libros"];

    for (const pub of publicaciones) {
        const numEtiquetas = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < numEtiquetas; i++) {
            await prisma.publicacion_etiquetas.create({
                data: {
                    id_publicacion: pub.id_publicacion,
                    etiqueta: etiquetas[Math.floor(Math.random() * etiquetas.length)]
                }
            });
        }
    }

    console.log("✔ Etiquetas creadas");

    // ============================
    // 4. CREAR COMENTARIOS
    // ============================

    for (let i = 1; i <= 40; i++) {
        const autor = usuarios[Math.floor(Math.random() * usuarios.length)];
        const pub = publicaciones[Math.floor(Math.random() * publicaciones.length)];

        await prisma.comentario.create({
            data: {
                id_usuario: autor.id_usuario,
                id_publicacion: pub.id_publicacion,
                texto: `Comentario ${i} en la publicación ${pub.id_publicacion}.`,
                puntuacion: Math.floor(Math.random() * 5) + 1
            }
        });
    }

    console.log("✔ Comentarios creados");

    // ============================
    // 5. CREAR SEGUIDORES
    // ============================

    for (let i = 0; i < 30; i++) {
        const seguidor = usuarios[Math.floor(Math.random() * usuarios.length)];
        const seguido = usuarios[Math.floor(Math.random() * usuarios.length)];

        if (seguidor.id_usuario !== seguido.id_usuario) {
            try {
                await prisma.seguidores.create({
                    data: {
                        id_seguidor: seguidor.id_usuario,
                        id_seguido: seguido.id_usuario
                    }
                });
            } catch {
                // Si ya existe, ignoramos
            }
        }
    }

    console.log("✔ Relaciones de seguidores creadas");

    console.log("🌱 SEED COMPLETADO");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
