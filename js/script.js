// ====================================
// VARIABLES GLOBALES
// ====================================
const visor = document.getElementById("visor");
const placeholder = document.getElementById("placeholder");
const visorContainer = document.getElementById("visor-container");
const btnFullscreen = document.getElementById("btn-fullscreen");
const modalFullscreen = document.getElementById("modal-fullscreen");
const modalIframe = document.getElementById("modal-iframe");

// Variable para tracking del PDF actual
let pdfActual = null;

// ====================================
// MENÚ HAMBURGUESA
// ====================================
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("show");
    // Cambiar icono del menú
    if (navLinks.classList.contains("show")) {
      menuToggle.innerHTML = "✕";
    } else {
      menuToggle.innerHTML = "&#9776;";
    }
  });
}

// Cerrar menú en móvil al hacer clic en un enlace
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("show");
    menuToggle.innerHTML = "&#9776;";
  });
});

// Cerrar menú al hacer clic fuera de él
document.addEventListener("click", (e) => {
  if (
    menuToggle &&
    navLinks &&
    !menuToggle.contains(e.target) &&
    !navLinks.contains(e.target)
  ) {
    navLinks.classList.remove("show");
    menuToggle.innerHTML = "&#9776;";
  }
});

// ====================================
// TRANSICIÓN ENTRE PÁGINAS
// ====================================
document.addEventListener("DOMContentLoaded", () => {
  // Cuando la página carga, aplicamos fade-in
  document.body.classList.add("fade-in");

  // Disparar animaciones de portada (h1, h2, p con clases .hero-*)
  const animatedElements = document.querySelectorAll(
    ".hero-title, .hero-subtitle, .hero-text"
  );
  animatedElements.forEach((el) => {
    el.style.animationPlayState = "running";
  });

  // Seleccionamos todos los enlaces internos
  const links = document.querySelectorAll("a[href$='.html']");
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      // Verificamos que no sea un enlace externo
      const target = link.getAttribute("href");
      if (target && !target.startsWith("http")) {
        e.preventDefault(); // Evitamos que cargue de golpe

        // Quitamos el fade-in para hacer fade-out
        document.body.classList.remove("fade-in");
        document.body.classList.add("fade-out");

        // Después de la animación, redirigimos
        setTimeout(() => {
          window.location.href = target;
        }, 300); // mismo tiempo que en CSS
      }
    });
  });
});

// ====================================
// VISUALIZACIÓN DE ARCHIVOS (PDF/HTML)
// ====================================
function verArchivo(ruta, tipo) {
  if (tipo === "pdf" || tipo === "html") {
    placeholder.style.display = "none";
    visor.style.display = "block";

    if (tipo === "pdf") {
      // MEJOR: Usar pagemode=none para Firefox
      visor.src = ruta + "#pagemode=none&toolbar=1";
    } else {
      visor.src = ruta;
    }

    pdfActual = ruta;
    visorContainer.classList.add("con-pdf");
    btnFullscreen.style.display = "block";
  }
}

// ====================================
// PANTALLA COMPLETA
// ====================================
function abrirPantallaCompleta() {
  if (pdfActual) {
    modalIframe.src = pdfActual;
    modalFullscreen.style.display = "block";
    document.body.style.overflow = "hidden";
  }
}

function cerrarPantallaCompleta() {
  modalFullscreen.style.display = "none";
  modalIframe.src = "";
  document.body.style.overflow = "auto";
}

// Cerrar modal con tecla ESC
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && modalFullscreen.style.display === "block") {
    cerrarPantallaCompleta();
  }
});

// Cerrar modal haciendo clic en el fondo
modalFullscreen.addEventListener("click", function (e) {
  if (e.target === modalFullscreen) {
    cerrarPantallaCompleta();
  }
});

// ====================================
// DESCARGA DE ARCHIVOS R
// ====================================
function descargarArchivo(ruta) {
  // Crear enlace temporal para descarga
  const link = document.createElement("a");
  link.href = ruta;
  link.download = ruta.split("/").pop();
  link.target = "_blank";

  // Simular click para iniciar descarga
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Mostrar mensaje de confirmación
  const nombreArchivo = ruta.split("/").pop();
  showNotification(`⬇️ Descargando: ${nombreArchivo}`);
}

// ====================================
// NOTIFICACIONES
// ====================================
function showNotification(mensaje) {
  // Crear elemento de notificación
  const notification = document.createElement("div");
  notification.textContent = mensaje;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #0a2a43;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    z-index: 9999;
    font-weight: 600;
    animation: slideIn 0.3s ease;
  `;

  // Agregar animación CSS
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  // Mostrar notificación
  document.body.appendChild(notification);

  // Remover después de 3 segundos
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// ====================================
// FUNCIONES DE COMPATIBILIDAD (Alias)
// ====================================
function verPDF(ruta) {
  verArchivo(ruta, "pdf");
}

function verCodigo(ruta) {
  descargarArchivo(ruta);
}
