document.addEventListener('DOMContentLoaded', async () => {
    actualizarBadgeCarrito();
    try {
        const respuesta = await fetch('data/plantas.json');
        const datos = await respuesta.json();

        const destacadas = datos.plantas.slice(0, 4);
        const contenedor = document.querySelector('#destacadas .row');
        contenedor.innerHTML = '';

        destacadas.forEach(planta => {
            contenedor.innerHTML += `
                <div class="col-md-3 mb-4">
                    <div class="card shadow-sm h-100 border-0">
                        <img src="${planta.imagen}" class="card-img-top" alt="${planta.nombre}">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${planta.nombre}</h5>
                            <a href="detalle.html?id=${planta.id}" class="btn btn-sm btn-outline-success mt-auto">
                                Ver detalle
                            </a>
                        </div>
                    </div>
                </div>`;
        });
    } catch (error) {
        console.error('Error al cargar plantas destacadas:', error);
    }
});

function actualizarBadgeCarrito() {
    let carrito = JSON.parse(localStorage.getItem('carritoAgroPlanta')) || [];
    const totalArticulos = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    
    const badge = document.getElementById('badge-carrito');
    if(badge) {
        // Si el total es mayor a 0 muestra el número, si no, lo deja en blanco o en 0
        badge.textContent = totalArticulos > 0 ? totalArticulos : '0';
    }
}