// -------------------- Importaciones Firebase --------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js";


// -------------------- Configuración Firebase --------------------
const firebaseConfig = {
  apiKey: "AIzaSyBM2fFPK3Fb5UK-PbWIYdP-SpFZug0mt-0",
  authDomain: "pruebaentreuvasycafe.firebaseapp.com",
  projectId: "pruebaentreuvasycafe",
  storageBucket: "pruebaentreuvasycafe.firebasestorage.app",
  messagingSenderId: "971782771779",
  appId: "1:971782771779:web:cd0eb94abdbe9cece3f0f6",
  measurementId: "G-GFFYS8EW70"
};

// -------------------- Inicialización de Firebase --------------------
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const auth = getAuth(app);
const storage = getStorage(app);


// -------------------- Selección de Categoría --------------------
// -------------------- Selección de Categoría --------------------
// Obtener los botones de categoría y el campo oculto para la categoría seleccionada
const categoriaInput = document.getElementById('categoria');
const categoriaButtons = document.querySelectorAll('.categoria-btn');

// Función para manejar la selección de categorías
categoriaButtons.forEach(button => {
button.addEventListener('click', () => {
const categoriaSeleccionada = button.getAttribute('data-categoria');

// Establecer la categoría seleccionada en el campo oculto
categoriaInput.value = categoriaSeleccionada;

// Activar el botón seleccionado
categoriaButtons.forEach(btn => btn.classList.remove('active'));
button.classList.add('active');

// Filtrar y mostrar productos según la categoría seleccionada
mostrarProductosPorCategoria(categoriaSeleccionada);
});
});

// Función para mostrar productos por categoría desde Firestore
// Función para mostrar productos por categoría desde Firestore
async function mostrarProductosPorCategoria(categoria) {
  try {
    // Obtener los productos de Firestore
    const productosSnapshot = await getDocs(collection(db, "productos"));
    const productos = productosSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));

    // Filtrar los productos que coinciden con la categoría seleccionada
    const productosFiltrados = productos.filter(producto => producto.categoria === categoria);

    // Limpiar productos actuales en la interfaz
    const productosContenedor = document.getElementById('productos-contenedor');
    productosContenedor.innerHTML = ''; // Limpiar contenedor antes de agregar los nuevos productos

    // Mostrar los productos filtrados en la interfaz
    if (productosFiltrados.length > 0) {
      productosFiltrados.forEach((producto) => {
        const col = document.createElement("div");
        col.className = "col-md-4";
        col.innerHTML = `
          <div class="card h-100 shadow-sm" data-id="${producto.id}">
            <img src="${producto.imagen}" class="card-img-top imagen-preview" alt="${producto.titulo}">
            <div class="card-body">
              <input type="text" class="form-control mb-2 titulo-input" value="${producto.titulo}" disabled />
              <textarea class="form-control mb-2 descripcion-input" disabled>${producto.descripcion}</textarea>
              <input type="number" class="form-control mb-2 precio-input" value="${producto.precio}" disabled />
              
              <div class="d-flex justify-content-between">
                <button class="btn btn-sm btn-outline-indigo btn-editar">Editar</button>
                <button class="btn btn-sm btn-outline-indigo btn-guardar" style="display:none;">Guardar</button>
                <button class="btn btn-sm btn-outline-indigo btn-eliminar">Eliminar</button>
              </div>
            </div>
          </div>
        `;
        productosContenedor.appendChild(col);

        // -------------------- Botones de cada producto --------------------
        const card = col.querySelector(".card");
        const tituloInput = card.querySelector(".titulo-input");
        const descripcionInput = card.querySelector(".descripcion-input");
        const precioInput = card.querySelector(".precio-input");

        const btnEditar = card.querySelector(".btn-editar");
        const btnGuardar = card.querySelector(".btn-guardar");
        const btnEliminar = card.querySelector(".btn-eliminar");

        // EDITAR
        btnEditar.addEventListener("click", () => {
          tituloInput.disabled = false;
          descripcionInput.disabled = false;
          precioInput.disabled = false;
          btnGuardar.style.display = "inline-block";
          btnEditar.style.display = "none";
        });

        // GUARDAR
        btnGuardar.addEventListener("click", async () => {
          const nuevoTitulo = tituloInput.value;
          const nuevaDescripcion = descripcionInput.value;
          const nuevoPrecio = parseInt(precioInput.value);

          try {
            const productoRef = doc(db, "productos", producto.id);
            await updateDoc(productoRef, {
              titulo: nuevoTitulo,
              descripcion: nuevaDescripcion,
              precio: nuevoPrecio,
            });

            tituloInput.disabled = true;
            descripcionInput.disabled = true;
            precioInput.disabled = true;
            btnGuardar.style.display = "none";
            btnEditar.style.display = "inline-block";

            Swal.fire({
              icon: 'success',
              title: '¡Producto actualizado!',
              showConfirmButton: false,
              timer: 1500
            });
          } catch (error) {
            Swal.fire({
              icon: 'error',
              title: 'Error al actualizar',
              text: error.message
            });
          }
        });

        // ELIMINAR
        btnEliminar.addEventListener("click", async () => {
          const confirmacion = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará el producto permanentemente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
          });

          if (confirmacion.isConfirmed) {
            try {
              await deleteDoc(doc(db, "productos", producto.id));

              Swal.fire({
                icon: 'success',
                title: 'Producto eliminado',
                showConfirmButton: false,
                timer: 1500
              });

              mostrarProductosPorCategoria(categoria); // recargar la lista con la misma categoría
            } catch (error) {
              Swal.fire({
                icon: 'error',
                title: 'Error al eliminar',
                text: error.message
              });
            }
          }
        });
      });
    } else {
      productosContenedor.innerHTML = '<p>No se encontraron productos en esta categoría.</p>';
    }
  } catch (error) {
    console.error("Error al obtener productos de Firestore:", error);
    Swal.fire({
      icon: 'error',
      title: 'Error al obtener productos',
      text: error.message
    });
  }
}

// Llamada inicial para mostrar productos por defecto o una categoría por defecto
mostrarProductosPorCategoria('Postres'); // Cambia según la categoría predeterminada si es necesario


// Llamada inicial para mostrar productos por defecto o una categoría por defecto
//mostrarProductosPorCategoria('Postres'); // Cambia según la categoría predeterminada si es necesario


// -------------------- Elementos del DOM --------------------
const lista = document.getElementById("lista-productos");
const loginForm = document.getElementById("login-form");
const panelAdmin = document.getElementById("panel-admin");
const form = document.getElementById('form-producto');


// -------------------- Agregar un nuevo producto con imagen --------------------
form.addEventListener("submit", async (e) => {
e.preventDefault();
console.log("🟡 Formulario de producto enviado");

const titulo = document.getElementById('titulo').value;
const imagenFile = document.getElementById('imagen').files[0];
const descripcion = document.getElementById('descripcion').value;
const precio = parseInt(document.getElementById('precio').value);
const categoria = document.getElementById('categoria').value;  // Obtener la categoría seleccionada

console.log("📋 Valores del formulario:");
console.log("Título:", titulo);
console.log("Descripción:", descripcion);
console.log("Precio:", precio);
console.log("Categoría:", categoria);  // Mostrar categoría en consola
console.log("Archivo seleccionado:", imagenFile);

if (!imagenFile) {
alert("Debes seleccionar una imagen.");
return;
}

if (!categoria) {
alert("Debes seleccionar una categoría.");
return;
}

try {
const timestamp = Date.now();
const storageRef = ref(storage, `imagenes/${timestamp}-${imagenFile.name}`);
console.log("📤 Subiendo imagen a Firebase Storage:", storageRef.fullPath);

await uploadBytes(storageRef, imagenFile);
console.log("✅ Imagen subida correctamente");

const imageUrl = await getDownloadURL(storageRef);
console.log("🌐 URL de la imagen:", imageUrl);

const nuevoProducto = {
  titulo,
  imagen: imageUrl,
  descripcion,
  precio,
  categoria // Añadir la categoría al producto
};

console.log("📝 Enviando producto a Firestore:", nuevoProducto);

await addDoc(collection(db, "productos"), nuevoProducto);
alert("✅ Producto agregado");

form.reset();
document.getElementById("imagen-preview").style.display = "none";
mostrarProductosPorCategoria(categoria);
} catch (error) {
console.error("❌ Error al guardar el producto:", error);
alert("Error al guardar producto: " + error.message);
}
});



// -------------------- Login del usuario --------------------
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      console.log("✅ Sesión iniciada");

      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Has iniciado sesión correctamente',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        
      });

    })
    .catch((error) => {
      Swal.fire({
        icon: 'error',
        title: 'Error de login',
        text: 'credenciales incorrectas',
        confirmButtonText: 'Intentar de nuevo'
      });
    });
});


// -------------------- Cerrar sesión --------------------
document.getElementById("cerrar-sesion").addEventListener("click", () => {
  signOut(auth);
});

// -------------------- Verifica si el usuario está autenticado --------------------
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginForm.parentElement.style.display = "none";
    panelAdmin.style.display = "block";
    cargarProductos();
  } else {
    loginForm.parentElement.style.display = "block";
    panelAdmin.style.display = "none";
  }
});