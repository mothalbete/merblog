// ===============================
// MODAL DE PUBLICACIÓN
// ===============================

function abrirModal() {
    document.getElementById("modal-bg").style.display = "flex";
}

function cerrarModal() {
    document.getElementById("modal-bg").style.display = "none";
}

window.addEventListener("click", function (e) {
    var fondo = document.getElementById("modal-bg");
    if (e.target === fondo) {
        cerrarModal();
    }
});

// ===============================
// ACORDEÓN
// ===============================

function toggleAcordeon() {
    var cont = document.getElementById("acordeon-contenido");
    cont.classList.toggle("abierto");
}

// ===============================
// CARGAR PUBLICACIÓN EN MODAL
// ===============================

function cargarPublicacion(id) {
    fetch("/publicaciones/" + id)
        .then(res => res.json())
        .then(data => {

            document.getElementById("modal-img").src = data.imagen;
            document.getElementById("modal-titulo").textContent = data.titulo;
            document.getElementById("modal-contenido-texto").textContent = data.contenido;

            // HACER EL NOMBRE CLICABLE
            document.getElementById("modal-autor").innerHTML =
                `<span class="usuario-link" data-user="${data.id_usuario}">@${data.autor}</span>`;

            document.getElementById("modal-fecha").textContent = new Date(data.fecha).toLocaleString();
            document.getElementById("modal-visitas").textContent = data.visitas;

            // Etiquetas
            let etiquetasHTML = "";
            data.etiquetas.forEach(e => {
                etiquetasHTML += `<span class="tag">#${e}</span>`;
            });
            document.getElementById("modal-etiquetas").innerHTML = etiquetasHTML;

            // Comentarios
            const contComentarios = document.getElementById("modal-comentarios");
            if (data.comentarios.length === 0) {
                contComentarios.innerHTML = "<p class='no-comments'>No hay comentarios.</p>";
            } else {
                let html = "";
                data.comentarios.forEach(c => {
                    html += `<div class="modal-comment">
                                <strong>
                                    <span class="usuario-link" data-user="${c.id_usuario}">
                                        @${c.autor}
                                    </span>
                                </strong>`;

                    if (!c.esAutor && !c.yoSoyEl) {
                        if (!c.yoLeSigo) {
                            html += `<button class="btn-seguir-small comentario-seguir" data-user="${c.id_usuario}">Seguir</button>`;
                        } else {
                            html += `<button class="btn-siguiendo-small comentario-siguiendo" data-user="${c.id_usuario}">Siguiendo</button>`;
                        }
                    }

                    html += `<br>${c.texto}</div>`;
                });
                contComentarios.innerHTML = html;
            }

            // Formulario comentarios
            document.getElementById("modal-form").action = "/comentarios/" + id;

            // Acciones (editar / eliminar / seguir)
            const actions = document.getElementById("modal-actions");

            if (data.propietario) {
                actions.innerHTML = `
                    <button class="btn-edit-small" onclick="abrirModalEditar(${data.id})">Editar</button>
                    <form action="/publicaciones/${data.id}/eliminar" method="POST" style="display:inline-block;" onsubmit="return confirm('¿Seguro que quieres eliminar esta publicación?');">
                        <button type="submit" class="btn-delete-small">Eliminar</button>
                    </form>`;
            } else {
                if (!data.yoLeSigo) {
                    actions.innerHTML = `<button class="btn-seguir-small modal-seguir" data-user="${data.id_usuario}">Seguir</button>`;
                } else {
                    actions.innerHTML = `<button class="btn-siguiendo-small modal-siguiendo" data-user="${data.id_usuario}">Siguiendo</button>`;
                }
            }

            activarBotonesSeguir();
        });
}

// ===============================
// SEGUIR / DEJAR DE SEGUIR (UNIFICADO)
// ===============================

function activarBotonesSeguir() {

    // ============================
    // BOTONES "SEGUIR"
    // ============================
    document.querySelectorAll(".seguir-btn, .modal-seguir, .comentario-seguir").forEach(btn => {

        btn.onclick = e => {
            e.stopPropagation();
            const id = btn.dataset.user;

            fetch(`/seguir/${id}`, { method: "POST" })
                .then(r => r.json())
                .then(data => {
                    if (data.ok) {

                        btn.classList.remove(
                            "btn-seguir-small",
                            "seguir-btn",
                            "modal-seguir",
                            "comentario-seguir"
                        );

                        btn.classList.add(
                            "btn-siguiendo-small",
                            "siguiendo-btn"
                        );

                        btn.textContent = "Siguiendo";

                        btn.blur();
                        btn.dispatchEvent(new Event("mouseleave"));

                        activarBotonesSeguir();
                    }
                });
        };
    });

    // ============================
    // BOTONES "SIGUIENDO"
    // ============================
    document.querySelectorAll(".siguiendo-btn, .modal-siguiendo, .comentario-siguiendo").forEach(btn => {

        btn.onmouseenter = () => btn.textContent = "Dejar de seguir";
        btn.onmouseleave = () => btn.textContent = "Siguiendo";

        btn.onclick = e => {
            e.stopPropagation();
            const id = btn.dataset.user;

            fetch(`/dejar-de-seguir/${id}`, { method: "POST" })
                .then(r => r.json())
                .then(data => {
                    if (data.ok) {

                        btn.onmouseenter = null;
                        btn.onmouseleave = null;

                        btn.classList.remove(
                            "btn-siguiendo-small",
                            "siguiendo-btn",
                            "modal-siguiendo",
                            "comentario-siguiendo"
                        );

                        btn.classList.add(
                            "btn-seguir-small",
                            "seguir-btn"
                        );

                        btn.textContent = "Seguir";

                        btn.blur();
                        btn.dispatchEvent(new Event("mouseleave"));

                        activarBotonesSeguir();
                    }
                });
        };
    });
}



// ===============================
// MODAL EDITAR PUBLICACIÓN
// ===============================

function abrirModalEditar(id) {
    document.getElementById("modal-editar-bg").style.display = "flex";

    fetch("/publicaciones/" + id + "/editar")
        .then(res => res.json())
        .then(data => {

            document.getElementById("editar-titulo").value = data.titulo;
            document.getElementById("editar-contenido").value = data.contenido;
            document.getElementById("editar-estado").value = data.estado;

            let etiquetasTexto = "";
            if (data.etiquetas && data.etiquetas.length > 0) {
                etiquetasTexto = data.etiquetas.join(", ");
            }
            document.getElementById("editar-etiquetas").value = etiquetasTexto;

            document.getElementById("form-editar-publicacion").action =
                "/publicaciones/" + id + "/editar";
        });
}

function cerrarModalEditar() {
    document.getElementById("modal-editar-bg").style.display = "none";
}

window.addEventListener("click", function (e) {
    var fondo = document.getElementById("modal-editar-bg");
    if (e.target === fondo) {
        cerrarModalEditar();
    }
});

// ===============================
// TARJETAS DEL DASHBOARD
// ===============================

function activarTarjetasDashboard() {
    document.querySelectorAll(".pub-card-vapor").forEach(card => {
        card.addEventListener("click", e => {

            if (e.target.closest(".delete-form")) return;
            if (e.target.classList.contains("btn-seguir-small")) return;
            if (e.target.classList.contains("btn-siguiendo-small")) return;
            if (e.target.classList.contains("edit-btn")) return;
            if (e.target.classList.contains("usuario-link")) return;
            if (e.target.classList.contains("like-btn")) return; // ⭐ EVITAR QUE EL LIKE ABRA EL MODAL

            const id = card.dataset.id;
            cargarPublicacion(id);
            abrirModal();
        });
    });
}

activarTarjetasDashboard();

// ===============================
// FILTROS
// ===============================

function activarFiltros() {
    const filtroFecha = document.getElementById("filtro-fecha");
    const filtroEtiqueta = document.getElementById("filtro-etiqueta");
    const cards = document.querySelectorAll(".pub-card-vapor");

    function aplicarFiltros() {
        const fecha = filtroFecha.value;
        const etiqueta = filtroEtiqueta.value.toLowerCase();

        cards.forEach(card => {
            const cardFecha = card.dataset.fecha;
            const cardEtiquetas = card.dataset.etiquetas.toLowerCase();

            const coincideFecha = !fecha || cardFecha === fecha;
            const coincideEtiqueta = !etiqueta || cardEtiquetas.includes(etiqueta);

            card.style.display = (coincideFecha && coincideEtiqueta) ? "block" : "none";
        });
    }

    if (filtroFecha) filtroFecha.addEventListener("change", aplicarFiltros);
    if (filtroEtiqueta) filtroEtiqueta.addEventListener("change", aplicarFiltros);
}

activarFiltros();


// ===============================
// LIKE / UNLIKE
// ===============================

function activarLikes() {
    document.querySelectorAll(".like-btn").forEach(btn => {
        btn.onclick = async e => {
            e.stopPropagation();

            const id = btn.dataset.id;
            const liked = btn.classList.contains("liked");

            const url = liked ? `/unlike/${id}` : `/like/${id}`;

            const res = await fetch(url, { method: "POST" });
            const data = await res.json();

            if (data.ok) {
                const countEl = document.getElementById(`likes-${id}`);
                let count = parseInt(countEl.textContent);

                if (liked) {
                    btn.classList.remove("liked");
                    countEl.textContent = count - 1;
                } else {
                    btn.classList.add("liked");
                    countEl.textContent = count + 1;
                }
            }
        };
    });
}

activarLikes();


// ===============================
// ACTIVAR BOTONES DE SEGUIR AL CARGAR
// ===============================

activarBotonesSeguir();
