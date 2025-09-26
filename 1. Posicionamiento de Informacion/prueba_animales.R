library(haven)
library(dplyr)
library(sf)
library(leaflet)
library(RColorBrewer)

# 1. Leer datos
caratula <- read_sav("CARATULA.sav")
cap400a_09 <- read_sav("09_CAP400A.sav")

# 2. Filtrar solo Puno
caratula_puno <- caratula %>% filter(NOMBREDD == "PUNO")
cap400a_puno <- cap400a_09 %>% filter(NOMBREDD == "PUNO")

# 3. Unir coordenadas
puno_merged <- cap400a_puno %>%
  left_join(caratula_puno %>% 
              select(ANIO, CCDD, CCPP, CCDI, NSEGM, ID_PROD, UA,
                     LATITUD, LONGITUD),
            by = c("ANIO", "CCDD", "CCPP", "CCDI", "NSEGM", "ID_PROD", "UA"))

# 4. Convertir a sf
puno_sf <- st_as_sf(puno_merged,
                    coords = c("LONGITUD", "LATITUD"),
                    crs = 4326)

# 5. Diccionario de P401 (tipo de ganado/animal)
tipo_ganado <- c(
  "1" = "VACUNOS", "2" = "OVINOS", "3" = "CAPRINOS", "4" = "PORCINOS",
  "5" = "LLAMAS", "6" = "ALPACAS", "7" = "CUYES", "14" = "POLLOS DE ENGORDE",
  "15" = "GALLINAS", "16" = "GALLOS", "9" = "PATOS", "10" = "PAVOS",
  "25" = "GANSOS", "26" = "AVESTRUCES", "27" = "CODORNICES", "28" = "BÚFALOS",
  "11" = "CONEJOS", "12" = "ABEJAS", "29" = "CABALLOS", "30" = "BURROS",
  "31" = "MULOS", "13" = "NINGUNO"
)

# 6. Asegurarse de que P401 sea carácter
puno_sf$P401 <- as.character(puno_sf$P401)

# 7. Tomar una muestra (2000 para que no pese mucho el mapa)
puno_animales <- puno_sf %>%
  filter(!is.na(P401), !st_is_empty(geometry)) %>%
  slice_sample(n = 2000)

# 8. Crear paleta automática con colores contrastantes
pal <- colorFactor(palette = "Dark2", domain = puno_animales$P401)

# 9. Mapa interactivo
mapa_animales <- leaflet(puno_animales) %>%
  addProviderTiles("CartoDB.Positron") %>%
  addCircleMarkers(
    radius = 5,                         # puntos más grandes
    fillColor = ~pal(P401),             # color de relleno según paleta
    color = "white",                    # borde blanco
    weight = 0.8,                       # grosor del borde
    opacity = 0.8,                      # opacidad del borde
    fillOpacity = 0.6,                  # opacidad del relleno
    popup = ~paste0("<b>Tipo de animal:</b> ", tipo_ganado[P401])
  ) %>%
  addLegend(
    position = "bottomright",
    pal = pal,
    values = ~P401,
    title = "Tipo de animal",
    labFormat = function(type, cuts, p) tipo_ganado[cuts]
  )

# Mostrar mapa
mapa_animales

##########################
# CONTEO DE ANIMALES (sin geometrías)
##########################
conteo_animales <- puno_sf %>%
  st_drop_geometry() %>%
  filter(!is.na(P401)) %>%
  group_by(P401) %>%
  summarise(
    Cantidad = n(),
    .groups = "drop"
  ) %>%
  mutate(Tipo_Animal = tipo_ganado[P401]) %>%
  select(P401, Tipo_Animal, Cantidad) %>%
  arrange(as.numeric(P401))

# Mostrar la tabla limpia
conteo_animales
