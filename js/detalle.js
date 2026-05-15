document.addEventListener('DOMContentLoaded', () => {
    const parametrosURL = new URLSearchParams(window.location.search);
    const idPlanta = parametrosURL.get('id');

    actualizarBadgeCarrito();

    if (idPlanta) {
        cargarDetallePlanta(idPlanta);
    } else {
        document.getElementById('info-principal').innerHTML =
            '<h2 class="text-danger text-center">Planta no encontrada.</h2>';
    }
});

async function cargarDetallePlanta(idBuscado) {
    try {
        const respuesta = await fetch('data/plantas.json');
        const datos = await respuesta.json();
        const planta = datos.plantas.find(p => p.id == idBuscado);

        if (!planta) {
            document.getElementById('info-principal').innerHTML =
                '<h2 class="text-danger text-center">Planta no encontrada.</h2>';
            return;
        }

        renderizarDetalle(planta);
        cargarInfoWikipedia(planta.nombre);
    } catch (error) {
        console.error('Error al cargar los detalles:', error);
    }
}

function renderizarDetalle(planta) {
    const historial = JSON.parse(localStorage.getItem('historialCompras')) || {};
    const stockReal = Math.max(0, planta.stock - (historial[planta.id] || 0));

    document.getElementById('nombre-planta').textContent = planta.nombre;
    document.getElementById('descripcion-planta').textContent =
        planta.descripcion || 'Información general no disponible.';
    document.getElementById('precio-planta').textContent = `$${planta.precio.toFixed(2)}`;
    document.getElementById('stock-planta').textContent = `${stockReal} unidades`;

    const inputCantidad = document.getElementById('cantidad-planta');
    inputCantidad.max = stockReal;

    // CSS class .img-detalle handles sizing (no inline styles)
    document.getElementById('contenedor-imagen-detalle').innerHTML =
        `<img src="${planta.imagen}" class="img-detalle shadow-sm" alt="${planta.nombre}">`;

    if (planta.cuidados) {
        document.getElementById('riego').textContent = planta.cuidados.riego || '--';
        document.getElementById('luz').textContent = planta.cuidados.luz || '--';
        document.getElementById('suelo').textContent = planta.cuidados.suelo || '--';
        document.getElementById('temperatura').textContent = planta.cuidados.temperatura || '--';
        document.getElementById('poda').textContent = planta.cuidados.poda || '--';
    }

    const btnAgregar = document.getElementById('btn-agregar-detalle');

    if (stockReal === 0) {
        btnAgregar.disabled = true;
        btnAgregar.textContent = 'Agotado';
        btnAgregar.classList.replace('btn-success', 'btn-secondary');
    } else {
        btnAgregar.addEventListener('click', () => agregarAlCarritoDesdeDetalle(planta));
    }
}

function agregarAlCarritoDesdeDetalle(planta) {
    let carrito = JSON.parse(localStorage.getItem('carritoAgroPlanta')) || [];
    const historial = JSON.parse(localStorage.getItem('historialCompras')) || {};

    const cantidadInput = parseInt(document.getElementById('cantidad-planta').value) || 1;
    const stockReal = Math.max(0, planta.stock - (historial[planta.id] || 0));

    const indiceExistente = carrito.findIndex(item => item.id == planta.id);
    const cantidadEnCarrito = indiceExistente !== -1 ? carrito[indiceExistente].cantidad : 0;

    if (cantidadEnCarrito + cantidadInput > stockReal) {
        alert(`¡No puedes pedir más de lo que hay! Quedan ${stockReal} unidades (y ya tienes ${cantidadEnCarrito} en tu carrito).`);
        return;
    }

    if (indiceExistente !== -1) {
        carrito[indiceExistente].cantidad += cantidadInput;
    } else {
        carrito.push({
            id: planta.id,
            nombre: planta.nombre,
            precio: planta.precio,
            imagen: planta.imagen,
            cantidad: cantidadInput,
            stockOriginal: planta.stock,
        });
    }

    localStorage.setItem('carritoAgroPlanta', JSON.stringify(carrito));
    actualizarBadgeCarrito();
    alert(`¡Se han añadido ${cantidadInput} ${planta.nombre}(s) a tu carrito!`);
}

function actualizarBadgeCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carritoAgroPlanta')) || [];
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);

    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.textContent.includes('Carrito')) {
            link.innerHTML = `🛒 Carrito <span class="badge bg-success">${totalItems}</span>`;
        }
    });
}

async function cargarInfoWikipedia(nombrePlanta) {
    const contenedorWiki = document.getElementById('info-wikipedia');
    if (!contenedorWiki) return;

    const terminoBusqueda = nombrePlanta.split(' ')[0];
    const url = `https://es.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=true&explaintext=true&generator=search&gsrsearch=${encodeURIComponent(terminoBusqueda)}&gsrlimit=1&format=json&origin=*`;

    try {
        const respuesta = await fetch(url);
        const datos = await respuesta.json();
        const paginas = datos.query?.pages;

        if (paginas) {
            const idPagina = Object.keys(paginas)[0];
            const extracto = paginas[idPagina].extract;

            if (extracto) {
                contenedorWiki.textContent = extracto.length > 350
                    ? extracto.substring(0, 350) + '...'
                    : extracto;
                return;
            }
        }

        contenedorWiki.textContent = `No se encontró información adicional en Wikipedia para "${terminoBusqueda}".`;
    } catch (error) {
        console.error('Error al consultar Wikipedia:', error);
        contenedorWiki.textContent = 'No se pudo conectar con Wikipedia. Revisa tu conexión.';
    }
}