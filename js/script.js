// ===== Menú hamburguesa =====
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });
}

// ===== Transición entre páginas =====
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
