let todasLasPlantas = [];
let categoriaActual = 'todos';

document.addEventListener('DOMContentLoaded', () => {
    actualizarBadgeCarrito();
    cargarCatalogo();
    configurarEventos();
});

async function cargarCatalogo() {
    const contenedor = document.getElementById('lista-plantas');

    try {
        const respuesta = await fetch('data/plantas.json');
        const datos = await respuesta.json();
        todasLasPlantas = datos.plantas;

        const parametrosURL = new URLSearchParams(window.location.search);
        const categoriaURL = parametrosURL.get('cat');
        categoriaActual = categoriaURL || 'todos';

        actualizarBotonesVisuales(categoriaActual);
        filtrarYRenderizar();
    } catch (error) {
        console.error('Error al cargar el catálogo:', error);
        contenedor.innerHTML = '<p class="text-danger text-center w-100">Error al cargar la información.</p>';
    }
}

async function configurarEventos() {
    document.querySelectorAll('#filtros .btn-group .btn').forEach(boton => {
        boton.addEventListener('click', (e) => {
            categoriaActual = e.target.getAttribute('data-categoria');
            actualizarBotonesVisuales(categoriaActual);
            document.getElementById('busqueda').value = '';
            filtrarYRenderizar();
        });
    });

    document.getElementById('busqueda').addEventListener('input', filtrarYRenderizar);
}

function actualizarBotonesVisuales(categoriaSeleccionada) {
    document.querySelectorAll('#filtros .btn-group .btn').forEach(boton => {
        const esActivo = boton.getAttribute('data-categoria') === categoriaSeleccionada;
        boton.classList.toggle('btn-success', esActivo);
        boton.classList.toggle('active', esActivo);
        boton.classList.toggle('btn-outline-success', !esActivo);
    });
}

function filtrarYRenderizar() {
    const textoBusqueda = document.getElementById('busqueda').value.toLowerCase().trim();

    let plantasFiltradas = categoriaActual === 'todos'
        ? todasLasPlantas
        : todasLasPlantas.filter(p => p.categoria === categoriaActual);

    if (textoBusqueda) {
        plantasFiltradas = plantasFiltradas.filter(p =>
            p.nombre.toLowerCase().includes(textoBusqueda)
        );
    }

    renderizarCatalogo(plantasFiltradas);
}

function renderizarCatalogo(plantas) {
    const contenedor = document.getElementById('lista-plantas');
    contenedor.innerHTML = '';

    if (plantas.length === 0) {
        contenedor.innerHTML = '<p class="text-center w-100 text-muted mt-5">No se encontraron plantas con esos criterios.</p>';
        return;
    }

    plantas.forEach(planta => {
        contenedor.innerHTML += `
            <div class="col-md-4 col-lg-3 mb-4">
                <div class="card h-100 border-0 shadow-sm">
                    <img src="${planta.imagen}" class="card-img-top" alt="${planta.nombre}">
                    <div class="card-body d-flex flex-column">
                        <span class="badge bg-success mb-2 align-self-start">${planta.categoria.toUpperCase()}</span>
                        <h5 class="card-title">${planta.nombre}</h5>
                        <a href="detalle.html?id=${planta.id}" class="btn btn-outline-success w-100 mt-auto">
                            Ver ficha técnica
                        </a>
                    </div>
                </div>
            </div>`;
    });
}
function actualizarBadgeCarrito() {
    let carrito = JSON.parse(localStorage.getItem('carritoAgroPlanta')) || [];
    const totalArticulos = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    
    const badge = document.getElementById('badge-carrito');
    if(badge) {
        // Si el total es mayor a 0 muestra el número, si no, lo deja en blanco o en 0
        badge.textContent = totalArticulos > 0 ? totalArticulos : '0';
    }
}