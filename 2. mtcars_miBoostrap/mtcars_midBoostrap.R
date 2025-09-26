library(boot)

# 1. Cargar dataset 
data(mtcars)

# 2. Usamos la columna mpg (millas por galón)
valores <- mtcars$mpg
n <- length(valores)  # cantidad de datos
cat("Número de autos en el dataset:", n, "\n")

# 3. Semilla para reproducibilidad (opcional)
set.seed(42)

# 4. Número de réplicas bootstrap
B <- 10000

# 5. Guardar resultados de medias bootstrap
medias_boot <- numeric(B)

# 6. Proceso bootstrap: muestreo aleatorio con reemplazo
for (b in 1:B) {
  muestra <- sample(valores, size = n, replace = TRUE)
  medias_boot[b] <- mean(muestra)
}

# 7. Cálculos finales
media_original <- mean(valores)  # estimación puntual de la media poblacional
media_bootstrap <- mean(medias_boot)  # media de las medias bootstrap
ic <- quantile(medias_boot, c(0.025, 0.975))  # IC al 95%

# 8. Resultados
cat("Media original (muestra):", media_original, "\n")
cat("Media promedio bootstrap:", media_bootstrap, "\n")
cat("Intervalo de confianza 95% (bootstrap):", ic, "\n")
