document.addEventListener('DOMContentLoaded', () => {
    renderizarCarrito();

    // Listeners registered once here, not inside renderizarCarrito(),
    // preventing duplicate handlers on each re-render.
    document.getElementById('btn-vaciar').addEventListener('click', vaciarCarrito);
    document.getElementById('btn-finalizar').addEventListener('click', finalizarCompra);
});

function vaciarCarrito() {
    localStorage.removeItem('carritoAgroPlanta');
    renderizarCarrito();
}

function finalizarCompra() {
    const carrito = JSON.parse(localStorage.getItem('carritoAgroPlanta')) || [];
    if (carrito.length === 0) return;

    // Persist purchase history to simulate stock reduction across sessions
    const historial = JSON.parse(localStorage.getItem('historialCompras')) || {};
    carrito.forEach(item => {
        historial[item.id] = (historial[item.id] || 0) + item.cantidad;
    });
    localStorage.setItem('historialCompras', JSON.stringify(historial));

    const modal = new bootstrap.Modal(document.getElementById('modalConfirmacion'));
    modal.show();

    localStorage.removeItem('carritoAgroPlanta');
    renderizarCarrito();
}

function renderizarCarrito() {
    const cuerpoCarrito = document.getElementById('cuerpo-carrito');
    const resumenSubtotal = document.getElementById('resumen-subtotal');
    const resumenTotal = document.getElementById('resumen-total');
    const btnFinalizar = document.getElementById('btn-finalizar');

    const carrito = JSON.parse(localStorage.getItem('carritoAgroPlanta')) || [];

    if (carrito.length === 0) {
        cuerpoCarrito.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-muted">
                    Tu carrito está vacío. <a href="tienda.html" class="text-success">Ir a la tienda</a>
                </td>
            </tr>`;
        resumenSubtotal.textContent = '$0.00';
        resumenTotal.textContent = '$0.00';
        btnFinalizar.disabled = true;
        return;
    }

    const historial = JSON.parse(localStorage.getItem('historialCompras')) || {};
    let totalCosto = 0;
    cuerpoCarrito.innerHTML = '';

    carrito.forEach((item, index) => {
        const subtotalItem = item.precio * item.cantidad;
        totalCosto += subtotalItem;

        const stockReal = Math.max(0, (item.stockOriginal || 50) - (historial[item.id] || 0));

        // CSS classes .cart-item-info, .cart-item-img, .input-qty replace all inline styles
        cuerpoCarrito.innerHTML += `
            <tr>
                <td>
                    <div class="cart-item-info">
                        <img src="${item.imagen}" class="cart-item-img" alt="${item.nombre}">
                        <strong>${item.nombre}</strong>
                    </div>
                </td>
                <td>$${item.precio.toFixed(2)}</td>
                <td>
                    <input type="number"
                        class="form-control form-control-sm input-qty cambiar-cantidad"
                        data-index="${index}"
                        data-stock="${stockReal}"
                        value="${item.cantidad}"
                        min="1"
                        max="${stockReal}">
                </td>
                <td><strong>$${subtotalItem.toFixed(2)}</strong></td>
                <td>
                    <button class="btn btn-sm btn-danger btn-eliminar" data-index="${index}">✕</button>
                </td>
            </tr>`;
    });

    resumenSubtotal.textContent = `$${totalCosto.toFixed(2)}`;
    resumenTotal.textContent = `$${totalCosto.toFixed(2)}`;
    btnFinalizar.disabled = false;

    asignarEventosEliminar();
    asignarEventosCantidad();
}

function asignarEventosEliminar() {
    document.querySelectorAll('.btn-eliminar').forEach(boton => {
        boton.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            let carrito = JSON.parse(localStorage.getItem('carritoAgroPlanta')) || [];
            carrito.splice(index, 1);
            localStorage.setItem('carritoAgroPlanta', JSON.stringify(carrito));
            renderizarCarrito();
        });
    });
}

function asignarEventosCantidad() {
    document.querySelectorAll('.cambiar-cantidad').forEach(input => {
        input.addEventListener('change', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            const maxStock = parseInt(e.target.getAttribute('data-stock'));
            let nuevaCantidad = parseInt(e.target.value);

            if (nuevaCantidad > maxStock) {
                alert(`Solo hay ${maxStock} unidades disponibles de este producto.`);
                nuevaCantidad = maxStock;
                e.target.value = maxStock;
            }

            if (nuevaCantidad < 1) return;

            let carrito = JSON.parse(localStorage.getItem('carritoAgroPlanta')) || [];
            carrito[index].cantidad = nuevaCantidad;
            localStorage.setItem('carritoAgroPlanta', JSON.stringify(carrito));
            renderizarCarrito();
        });
    });
}