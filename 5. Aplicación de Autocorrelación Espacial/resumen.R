# analisis de autocorrelacion espacial en r
library(spdep)
library(sf)
library(raster)
library(ggplot2)
library(viridis)
# simulacion de datos espaciales
set.seed(123)

# crear grilla espacial (50x50 celdas)
n_rows <- 50
n_cols <- 50
n_cells <- n_rows * n_cols

# crear coordenadas
coords <- expand.grid(x = 1:n_cols, y = 1:n_rows)

# articulo 1: ndvi (vegetacion) con autocorrelacion espacial fuerte
ndvi <- matrix(0, nrow = n_rows, ncol = n_cols)
for(i in 1:n_rows) {
  for(j in 1:n_cols) {
    base <- 0.3 + 0.5 * (i/n_rows) + 0.3 * (j/n_cols)
    ndvi[i,j] <- base + rnorm(1, 0, 0.1)
  }
}
# suavizar para incrementar autocorrelacion
ndvi_raster <- raster(ndvi)
ndvi_smooth <- raster::focal(ndvi_raster, w=matrix(1,3,3), fun=mean, na.rm=TRUE)
ndvi_vector <- as.vector(values(ndvi_smooth))

# remover na's y valores infinitos
ndvi_vector[is.na(ndvi_vector)] <- mean(ndvi_vector, na.rm = TRUE)
ndvi_vector[is.infinite(ndvi_vector)] <- mean(ndvi_vector[is.finite(ndvi_vector)])

# articulo 2: indice de exposicion costera (0-1)
exposure <- numeric(n_cells)
# crear hotspots de alta exposicion
hotspot1 <- which(coords$x < 15 & coords$y < 15)
hotspot2 <- which(coords$x > 35 & coords$y > 35)
exposure[hotspot1] <- runif(length(hotspot1), 0.6, 0.95)
exposure[hotspot2] <- runif(length(hotspot2), 0.65, 1.0)
# areas de baja exposicion
coldspot <- which(coords$x > 35 & coords$y < 15)
exposure[coldspot] <- runif(length(coldspot), 0.05, 0.25)
# resto con valores medios
rest <- setdiff(1:n_cells, c(hotspot1, hotspot2, coldspot))
exposure[rest] <- runif(length(rest), 0.3, 0.6)

# articulo 3: incidencia de parotiditis (casos por 100,000 hab)
incidence <- numeric(n_cells)
for(i in 1:n_cells) {
  base_incidence <- 80 - 60 * (coords$x[i] / n_cols)
  incidence[i] <- max(0, base_incidence + rnorm(1, 0, 15))
}

# crear data frame espacial
spatial_data <- data.frame(
  id = 1:n_cells,
  x = coords$x,
  y = coords$y,
  ndvi = ndvi_vector,
  exposure = exposure,
  incidence = incidence
)

# convertir a objeto sf
spatial_sf <- st_as_sf(spatial_data, coords = c("x", "y"))

# construccion de matriz de pesos espaciales

# crear matriz de vecindad queen
coords_matrix <- as.matrix(coords)
nb_queen <- cell2nb(nrow = n_rows, ncol = n_cols, type = "queen")

# crear matriz de pesos espaciales
w_queen <- nb2listw(nb_queen, style = "W", zero.policy = TRUE)

print("Resumen de estructura de vecindad:")
print(summary(nb_queen))

# indice global de moran

cat("\n========================================\n")
cat("ÍNDICE GLOBAL DE MORAN\n")

# articulo 1: ndvi
moran_ndvi <- moran.test(spatial_data$ndvi, w_queen, 
                         zero.policy = TRUE, 
                         na.action = na.omit)
cat("Artículo 1 - NDVI:\n")
cat(sprintf("  Moran's I = %.4f\n", moran_ndvi$estimate["Moran I statistic"]))
cat(sprintf("  p-value = %.6f\n", moran_ndvi$p.value))
cat(sprintf("  Interpretación: %s\n\n", 
            ifelse(moran_ndvi$p.value < 0.01, 
                   "Clustering espacial SIGNIFICATIVO", 
                   "No hay evidencia significativa de clustering")))

# articulo 2: indice de exposicion
moran_exposure <- moran.test(spatial_data$exposure, w_queen, 
                             zero.policy = TRUE, 
                             na.action = na.omit)
cat("Artículo 2 - Índice de Exposición Costera:\n")
cat(sprintf("  Moran's I = %.4f\n", moran_exposure$estimate["Moran I statistic"]))
cat(sprintf("  p-value = %.6f\n", moran_exposure$p.value))
cat(sprintf("  Interpretación: %s\n\n", 
            ifelse(moran_exposure$p.value < 0.001, 
                   "Fuerte dependencia espacial", 
                   "Dependencia espacial moderada o ausente")))

# articulo 3: incidencia de parotiditis
moran_incidence <- moran.test(spatial_data$incidence, w_queen, 
                              zero.policy = TRUE, 
                              na.action = na.omit)
cat("Artículo 3 - Incidencia de Parotiditis:\n")
cat(sprintf("  Moran's I = %.4f\n", moran_incidence$estimate["Moran I statistic"]))
cat(sprintf("  p-value = %.6f\n", moran_incidence$p.value))
cat(sprintf("  Interpretación: %s\n\n", 
            ifelse(moran_incidence$p.value < 0.001, 
                   "Clustering espacial significativo", 
                   "Distribución espacial aleatoria")))

# grafico de moran (scatterplot)

# limpiar datos
ndvi_clean <- spatial_data$ndvi
ndvi_clean[is.na(ndvi_clean) | is.infinite(ndvi_clean)] <- 
  mean(ndvi_clean[is.finite(ndvi_clean)], na.rm = TRUE)

# estandarizar
ndvi_scaled <- scale(ndvi_clean)[,1]

if(any(!is.finite(ndvi_scaled))) {
  ndvi_scaled[!is.finite(ndvi_scaled)] <- 0
}

# calcular lag espacial
ndvi_lag <- lag.listw(w_queen, ndvi_scaled, zero.policy = TRUE)

# crear datos para moran scatterplot
moran_plot_data <- data.frame(
  value = ndvi_scaled,
  lagged = ndvi_lag
)

moran_plot_data <- moran_plot_data[complete.cases(moran_plot_data), ]

# clasificar en cuadrantes
moran_plot_data$quadrant <- with(moran_plot_data, 
                                 ifelse(value > 0 & lagged > 0, "HH (High-High)",
                                        ifelse(value < 0 & lagged < 0, "LL (Low-Low)",
                                               ifelse(value > 0 & lagged < 0, "HL (High-Low)", 
                                                      "LH (Low-High)"))))

# visualizar
p1 <- ggplot(moran_plot_data, aes(x = value, y = lagged, color = quadrant)) +
  geom_point(alpha = 0.6, size = 2) +
  geom_hline(yintercept = 0, linetype = "dashed", color = "gray40") +
  geom_vline(xintercept = 0, linetype = "dashed", color = "gray40") +
  geom_smooth(aes(group = 1), method = "lm", se = FALSE, 
              color = "red", linewidth = 1) +
  scale_color_manual(values = c("HH (High-High)" = "#d73027",
                                "LL (Low-Low)" = "#4575b4",
                                "HL (High-Low)" = "#fee090",
                                "LH (Low-High)" = "#91bfdb")) +
  labs(title = "Moran Scatterplot - NDVI",
       subtitle = sprintf("Moran's I = %.3f", 
                          moran_ndvi$estimate["Moran I statistic"]),
       x = "NDVI (estandarizado)",
       y = "NDVI Lag Espacial",
       color = "Cuadrante") +
  theme_minimal() +
  theme(legend.position = "bottom")

print(p1)

# analisis lisa

cat("ANÁLISIS LISA\n")
cat("========================================\n\n")

# articulo 1: ndvi
lisa_ndvi <- localmoran(spatial_data$ndvi, w_queen, zero.policy = TRUE)
spatial_data$lisa_ndvi_Ii <- lisa_ndvi[,1]
spatial_data$lisa_ndvi_pval <- lisa_ndvi[,5]

# clasificar en clusters
spatial_data$cluster_ndvi <- "No significativo"
spatial_data$cluster_ndvi[spatial_data$lisa_ndvi_pval < 0.05 & 
                            scale(spatial_data$ndvi) > 0 & 
                            lag.listw(w_queen, scale(spatial_data$ndvi), 
                                      zero.policy = TRUE) > 0] <- "HH"
spatial_data$cluster_ndvi[spatial_data$lisa_ndvi_pval < 0.05 & 
                            scale(spatial_data$ndvi) < 0 & 
                            lag.listw(w_queen, scale(spatial_data$ndvi), 
                                      zero.policy = TRUE) < 0] <- "LL"
spatial_data$cluster_ndvi[spatial_data$lisa_ndvi_pval < 0.05 & 
                            scale(spatial_data$ndvi) > 0 & 
                            lag.listw(w_queen, scale(spatial_data$ndvi), 
                                      zero.policy = TRUE) < 0] <- "HL"
spatial_data$cluster_ndvi[spatial_data$lisa_ndvi_pval < 0.05 & 
                            scale(spatial_data$ndvi) < 0 & 
                            lag.listw(w_queen, scale(spatial_data$ndvi), 
                                      zero.policy = TRUE) > 0] <- "LH"

cat("Clusters LISA - NDVI:\n")
print(table(spatial_data$cluster_ndvi))

# articulo 2: exposicion
lisa_exposure <- localmoran(spatial_data$exposure, w_queen, zero.policy = TRUE)
spatial_data$lisa_exposure_Ii <- lisa_exposure[,1]
spatial_data$lisa_exposure_pval <- lisa_exposure[,5]

spatial_data$cluster_exposure <- "No significativo"
spatial_data$cluster_exposure[spatial_data$lisa_exposure_pval < 0.05 & 
                                scale(spatial_data$exposure) > 0 & 
                                lag.listw(w_queen, scale(spatial_data$exposure), 
                                          zero.policy = TRUE) > 0] <- "HH"
spatial_data$cluster_exposure[spatial_data$lisa_exposure_pval < 0.05 & 
                                scale(spatial_data$exposure) < 0 & 
                                lag.listw(w_queen, scale(spatial_data$exposure), 
                                          zero.policy = TRUE) < 0] <- "LL"

cat("\nClusters LISA - Exposición:\n")
print(table(spatial_data$cluster_exposure))

# articulo 3: incidencia
lisa_incidence <- localmoran(spatial_data$incidence, w_queen, zero.policy = TRUE)
spatial_data$lisa_incidence_Ii <- lisa_incidence[,1]
spatial_data$lisa_incidence_pval <- lisa_incidence[,5]

spatial_data$cluster_incidence <- "No significativo"
spatial_data$cluster_incidence[spatial_data$lisa_incidence_pval < 0.05 & 
                                 scale(spatial_data$incidence) > 0 & 
                                 lag.listw(w_queen, scale(spatial_data$incidence), 
                                           zero.policy = TRUE) > 0] <- "HH"
spatial_data$cluster_incidence[spatial_data$lisa_incidence_pval < 0.05 & 
                                 scale(spatial_data$incidence) < 0 & 
                                 lag.listw(w_queen, scale(spatial_data$incidence), 
                                           zero.policy = TRUE) < 0] <- "LL"

cat("\nClusters LISA - Incidencia:\n")
print(table(spatial_data$cluster_incidence))

# getis-ord gi* (analisis de hotspots)

cat("ANÁLISIS GETIS-ORD Gi*\n")
cat("========================================\n\n")

# incluir la ubicacion i en el calculo
nb_queen_self <- include.self(nb_queen)
w_queen_self <- nb2listw(nb_queen_self, style = "W", zero.policy = TRUE)

# articulo 1: ndvi
gi_ndvi <- localG(spatial_data$ndvi, w_queen_self, zero.policy = TRUE)
spatial_data$gi_ndvi <- as.numeric(gi_ndvi)

spatial_data$hotspot_ndvi <- "No significativo"
spatial_data$hotspot_ndvi[spatial_data$gi_ndvi > 1.96] <- "Hotspot (p < 0.05)"
spatial_data$hotspot_ndvi[spatial_data$gi_ndvi > 2.58] <- "Hotspot (p < 0.01)"
spatial_data$hotspot_ndvi[spatial_data$gi_ndvi < -1.96] <- "Coldspot (p < 0.05)"
spatial_data$hotspot_ndvi[spatial_data$gi_ndvi < -2.58] <- "Coldspot (p < 0.01)"

cat("Hotspots/Coldspots Gi* - NDVI:\n")
print(table(spatial_data$hotspot_ndvi))

# articulo 2: exposicion
gi_exposure <- localG(spatial_data$exposure, w_queen_self, zero.policy = TRUE)
spatial_data$gi_exposure <- as.numeric(gi_exposure)

spatial_data$hotspot_exposure <- "No significativo"
spatial_data$hotspot_exposure[spatial_data$gi_exposure > 1.96] <- "Hotspot (p < 0.05)"
spatial_data$hotspot_exposure[spatial_data$gi_exposure > 2.58] <- "Hotspot (p < 0.01)"
spatial_data$hotspot_exposure[spatial_data$gi_exposure < -1.96] <- "Coldspot (p < 0.05)"
spatial_data$hotspot_exposure[spatial_data$gi_exposure < -2.58] <- "Coldspot (p < 0.01)"

cat("\nHotspots/Coldspots Gi* - Exposición:\n")
print(table(spatial_data$hotspot_exposure))

# articulo 3: incidencia
gi_incidence <- localG(spatial_data$incidence, w_queen_self, zero.policy = TRUE)
spatial_data$gi_incidence <- as.numeric(gi_incidence)

spatial_data$hotspot_incidence <- "No significativo"
spatial_data$hotspot_incidence[spatial_data$gi_incidence > 1.96] <- "Hotspot (p < 0.05)"
spatial_data$hotspot_incidence[spatial_data$gi_incidence > 2.58] <- "Hotspot (p < 0.01)"
spatial_data$hotspot_incidence[spatial_data$gi_incidence < -1.96] <- "Coldspot (p < 0.05)"
spatial_data$hotspot_incidence[spatial_data$gi_incidence < -2.58] <- "Coldspot (p < 0.01)"

cat("\nHotspots/Coldspots Gi* - Incidencia:\n")
print(table(spatial_data$hotspot_incidence))

# visualizacion de resultados

# mapas para ndvi

# variable original
p2 <- ggplot(spatial_data, aes(x = x, y = y, fill = ndvi)) +
  geom_tile() +
  scale_fill_viridis(option = "viridis", name = "NDVI") +
  labs(title = "Artículo 1: NDVI",
       subtitle = "Patrón espacial con gradiente SE-NO") +
  theme_minimal() +
  coord_equal()

# clusters lisa
p3 <- ggplot(spatial_data, aes(x = x, y = y, fill = cluster_ndvi)) +
  geom_tile() +
  scale_fill_manual(values = c("HH" = "#d73027",
                               "LL" = "#4575b4",
                               "HL" = "#fee090",
                               "LH" = "#91bfdb",
                               "No significativo" = "gray90"),
                    name = "Tipo de Cluster") +
  labs(title = "Clusters LISA - NDVI",
       subtitle = "High-High y Low-Low") +
  theme_minimal() +
  coord_equal()

# hotspots gi*
p4 <- ggplot(spatial_data, aes(x = x, y = y, fill = hotspot_ndvi)) +
  geom_tile() +
  scale_fill_manual(values = c("Hotspot (p < 0.01)" = "#b2182b",
                               "Hotspot (p < 0.05)" = "#ef8a62",
                               "No significativo" = "gray90",
                               "Coldspot (p < 0.05)" = "#67a9cf",
                               "Coldspot (p < 0.01)" = "#2166ac"),
                    name = "Gi*") +
  labs(title = "Hotspots Getis-Ord Gi* - NDVI",
       subtitle = "Puntos calientes y fríos") +
  theme_minimal() +
  coord_equal()

print(p2)
print(p3)
print(p4)

# mapas para exposicion
p5 <- ggplot(spatial_data, aes(x = x, y = y, fill = exposure)) +
  geom_tile() +
  scale_fill_viridis(option = "magma", name = "Exposición") +
  labs(title = "Artículo 2: Índice de Exposición Costera",
       subtitle = "Exposición al aumento del nivel del mar") +
  theme_minimal() +
  coord_equal()

p6 <- ggplot(spatial_data, aes(x = x, y = y, fill = cluster_exposure)) +
  geom_tile() +
  scale_fill_manual(values = c("HH" = "#d73027",
                               "LL" = "#4575b4",
                               "No significativo" = "gray90"),
                    name = "Tipo de Cluster") +
  labs(title = "Clusters LISA - Exposición Costera",
       subtitle = "Áreas de alta y baja vulnerabilidad") +
  theme_minimal() +
  coord_equal()

print(p5)
print(p6)

# mapas para incidencia
p7 <- ggplot(spatial_data, aes(x = x, y = y, fill = incidence)) +
  geom_tile() +
  scale_fill_viridis(option = "plasma", name = "Casos/100k") +
  labs(title = "Artículo 3: Incidencia de Parotiditis",
       subtitle = "Gradiente oeste-este decreciente") +
  theme_minimal() +
  coord_equal()

p8 <- ggplot(spatial_data, aes(x = x, y = y, fill = cluster_incidence)) +
  geom_tile() +
  scale_fill_manual(values = c("HH" = "#d73027",
                               "LL" = "#4575b4",
                               "No significativo" = "gray90"),
                    name = "Tipo de Cluster") +
  labs(title = "Clusters LISA - Incidencia de Parotiditis",
       subtitle = "Patrón espacial estratificado") +
  theme_minimal() +
  coord_equal()

print(p7)
print(p8)

# tabla resumen de resultados

cat("TABLA RESUMEN COMPARATIVA\n")
cat("========================================\n\n")

resumen <- data.frame(
  Artículo = c("Art. 1: Vegetación",
               "Art. 2: Exposición Costera",
               "Art. 3: Incidencia Parotiditis"),
  `Moran's I` = c(
    sprintf("%.3f", moran_ndvi$estimate["Moran I statistic"]),
    sprintf("%.3f", moran_exposure$estimate["Moran I statistic"]),
    sprintf("%.3f", moran_incidence$estimate["Moran I statistic"])
  ),
  `p-value` = c(
    ifelse(moran_ndvi$p.value < 0.001, "< 0.001", 
           sprintf("%.4f", moran_ndvi$p.value)),
    ifelse(moran_exposure$p.value < 0.001, "< 0.001", 
           sprintf("%.4f", moran_exposure$p.value)),
    ifelse(moran_incidence$p.value < 0.001, "< 0.001", 
           sprintf("%.4f", moran_incidence$p.value))
  ),
  `Interpretación` = c(
    "Fuerte clustering espacial",
    "Dependencia espacial significativa",
    "Clustering significativo"
  ),
  `Clusters HH` = c(
    sum(spatial_data$cluster_ndvi == "HH"),
    sum(spatial_data$cluster_exposure == "HH"),
    sum(spatial_data$cluster_incidence == "HH")
  ),
  `Clusters LL` = c(
    sum(spatial_data$cluster_ndvi == "LL"),
    sum(spatial_data$cluster_exposure == "LL"),
    sum(spatial_data$cluster_incidence == "LL")
  )
)

print(resumen)



