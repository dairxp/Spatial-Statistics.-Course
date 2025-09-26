// Esperar a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", function () {
  // Inicializar todas las funcionalidades
  initMobileMenu();
  initScrollEffects();
  initAnimations();
  initNavbarScroll();
});

// Menú móvil hamburguesa
function initMobileMenu() {
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", function () {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
    });

    // Cerrar menú al hacer clic en un enlace
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", function () {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
      });
    });
  }
}

// Efectos de scroll para la navbar
function initNavbarScroll() {
  const navbar = document.querySelector(".navbar");

  if (navbar) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 100) {
        navbar.style.background = "rgba(26, 35, 126, 0.95)";
        navbar.style.backdropFilter = "blur(10px)";
      } else {
        navbar.style.background = "var(--primary-color)";
        navbar.style.backdropFilter = "none";
      }
    });
  }
}

// Animaciones de entrada
function initAnimations() {
  // Observador de intersección para animaciones
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animation = "fadeInUp 0.8s ease forwards";
      }
    });
  }, observerOptions);

  // Observar elementos que deben animarse
  const elementsToAnimate = document.querySelectorAll(
    ".content-card, .info-card, .unit-table"
  );
  elementsToAnimate.forEach((element) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(30px)";
    observer.observe(element);
  });
}

// Efectos de scroll suave
function initScrollEffects() {
  // Scroll suave para enlaces internos
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });
}

// Función para resaltar la página activa en la navegación
function setActiveNavItem() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    link.classList.remove("active");
    const href = link.getAttribute("href");
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });
}

// Efectos visuales adicionales
function createParticleEffect() {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  // Crear partículas flotantes en el hero
  for (let i = 0; i < 50; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            pointer-events: none;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${3 + Math.random() * 4}s ease-in-out infinite;
            animation-delay: ${Math.random() * 2}s;
        `;
    hero.appendChild(particle);
  }
}

// Llamar a las funciones adicionales
setActiveNavItem();
createParticleEffect();

// Agregar estilos CSS dinámicamente para las partículas
const style = document.createElement("style");
style.textContent = `
    @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0; }
        50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
    }
    
    .hamburger.active .bar:nth-child(2) {
        opacity: 0;
    }
    
    .hamburger.active .bar:nth-child(1) {
        transform: translateY(8px) rotate(45deg);
    }
    
    .hamburger.active .bar:nth-child(3) {
        transform: translateY(-8px) rotate(-45deg);
    }
`;
document.head.appendChild(style);

// Función para mostrar/ocultar contenido con animaciones
function toggleContent(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    if (element.style.display === "none" || element.style.display === "") {
      element.style.display = "block";
      element.style.animation = "fadeInUp 0.5s ease forwards";
    } else {
      element.style.animation = "fadeOut 0.5s ease forwards";
      setTimeout(() => {
        element.style.display = "none";
      }, 500);
    }
  }
}

// Agregar animación de fadeOut
style.textContent += `
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-30px); }
    }
`;

// Función para manejar formularios (si los hay en el futuro)
function handleFormSubmission() {
  const forms = document.querySelectorAll("form");
  forms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      // Aquí se puede agregar lógica para manejar formularios
      console.log("Formulario enviado");
    });
  });
}

// Función de utilidad para crear elementos de carga
function showLoadingSpinner(targetElement) {
  const spinner = document.createElement("div");
  spinner.className = "loading-spinner";
  spinner.innerHTML = '<div class="spinner"></div>';
  targetElement.appendChild(spinner);

  // Agregar estilos para el spinner
  style.textContent += `
        .loading-spinner {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 2rem;
        }
        
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(26, 35, 126, 0.1);
            border-top: 4px solid var(--primary-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
}

// Función para ocultar el spinner de carga
function hideLoadingSpinner() {
  const spinners = document.querySelectorAll(".loading-spinner");
  spinners.forEach((spinner) => spinner.remove());
}

// Manejo de errores globales
window.addEventListener("error", function (e) {
  console.error("Error en la aplicación:", e.error);
});

// Optimización de rendimiento - lazy loading para imágenes
function initLazyLoading() {
  const images = document.querySelectorAll("img[data-src]");

  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove("lazy");
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));
  } else {
    // Fallback para navegadores sin soporte
    images.forEach((img) => {
      img.src = img.dataset.src;
    });
  }
}
