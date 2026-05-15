let todasLasPlantasTienda = [];

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    actualizarBadgeCarrito();
});

async function cargarProductos() {
    try {
        const respuesta = await fetch('data/plantas.json');
        const datos = await respuesta.json();
        todasLasPlantasTienda = datos.plantas;
        renderizarProductos(todasLasPlantasTienda);
        configurarFiltros();
    } catch (error) {
        console.error('Error al cargar los productos:', error);
    }
}

function calcularStockReal(planta) {
    const historial = JSON.parse(localStorage.getItem('historialCompras')) || {};
    return Math.max(0, planta.stock - (historial[planta.id] || 0));
}

function renderizarProductos(plantas) {
    const contenedor = document.getElementById('contenedor-productos');
    contenedor.innerHTML = '';

    plantas.forEach(planta => {
        const stockReal = calcularStockReal(planta);
        const agotado = stockReal === 0;

        contenedor.innerHTML += `
            <div class="col-md-4 mb-4">
                <div class="card h-100 shadow-sm border-0">
                    <img src="${planta.imagen}" class="card-img-top" alt="${planta.nombre}">
                    <div class="card-body text-center d-flex flex-column">
                        <h5 class="card-title">${planta.nombre}</h5>
                        <p class="text-muted small">Categoría: ${planta.categoria}</p>
                        <p class="h4 text-success">$${planta.precio.toFixed(2)}</p>
                        <p class="small text-muted">Disponibles: ${stockReal}</p>
                        <div class="d-flex align-items-center justify-content-center mt-auto mb-2">
                            <label class="me-2 fw-bold small" for="cant-tienda-${planta.id}">Cant:</label>
                            <input type="number" id="cant-tienda-${planta.id}"
                                class="form-control text-center w-50"
                                value="1" min="1" max="${stockReal}" ${agotado ? 'disabled' : ''}>
                        </div>
                        <button class="btn btn-outline-success w-100 btn-agregar"
                            data-id="${planta.id}"
                            data-nombre="${planta.nombre}"
                            data-precio="${planta.precio}"
                            data-imagen="${planta.imagen}"
                            data-stock="${planta.stock}"
                            ${agotado ? 'disabled' : ''}>
                            ${agotado ? 'Agotado' : 'Agregar al carrito'}
                        </button>
                    </div>
                </div>
            </div>`;
    });

    asignarEventosAgregar();
}

function asignarEventosAgregar() {
    document.querySelectorAll('.btn-agregar').forEach(boton => {
        boton.addEventListener('click', (e) => {
            const { id, nombre, precio, imagen, stock } = e.target.dataset;
            const cantidad = parseInt(document.getElementById(`cant-tienda-${id}`).value) || 1;
            agregarAlCarrito(id, nombre, parseFloat(precio), imagen, cantidad, parseInt(stock));
        });
    });
}

function agregarAlCarrito(id, nombre, precio, imagen, cantidad, stockOriginal) {
    let carrito = JSON.parse(localStorage.getItem('carritoAgroPlanta')) || [];
    const historial = JSON.parse(localStorage.getItem('historialCompras')) || {};

    const stockReal = Math.max(0, stockOriginal - (historial[id] || 0));
    const indiceExistente = carrito.findIndex(item => item.id == id);
    const cantidadEnCarrito = indiceExistente !== -1 ? carrito[indiceExistente].cantidad : 0;

    if (cantidadEnCarrito + cantidad > stockReal) {
        alert(`¡Stock insuficiente! Quedan ${stockReal} unidades disponibles (ya tienes ${cantidadEnCarrito} en tu carrito).`);
        return;
    }

    if (indiceExistente !== -1) {
        carrito[indiceExistente].cantidad += cantidad;
    } else {
        carrito.push({ id, nombre, precio, imagen, cantidad, stockOriginal });
    }

    localStorage.setItem('carritoAgroPlanta', JSON.stringify(carrito));
    actualizarBadgeCarrito();
    alert(`¡Se han agregado ${cantidad} ${nombre}(s) al carrito! 🌱`);
}

function actualizarBadgeCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carritoAgroPlanta')) || [];
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    const badge = document.getElementById('cart-badge');
    if (badge) badge.textContent = totalItems;
}

function configurarFiltros() {
    const sliderPrecio = document.getElementById('filtro-precio');
    const valorPrecio = document.getElementById('valor-precio');

    sliderPrecio.addEventListener('input', (e) => {
        valorPrecio.textContent = e.target.value;
        aplicarFiltros();
    });

    document.querySelectorAll('.filtro-categoria').forEach(chk => {
        chk.addEventListener('change', aplicarFiltros);
    });
}

function aplicarFiltros() {
    const precioMax = parseFloat(document.getElementById('filtro-precio').value);
    const categoriasSeleccionadas = Array.from(
        document.querySelectorAll('.filtro-categoria:checked')
    ).map(chk => chk.value);

    const plantasFiltradas = todasLasPlantasTienda.filter(planta => {
        const cumplePrecio = planta.precio <= precioMax;
        const cumpleCategoria = categoriasSeleccionadas.length === 0
            || categoriasSeleccionadas.includes(planta.categoria);
        return cumplePrecio && cumpleCategoria;
    });

    renderizarProductos(plantasFiltradas);
}