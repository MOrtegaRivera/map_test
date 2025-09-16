// Inicializamos el mapa (mejor rendimiento con muchos vectores)
const map = L.map("map", { minZoom: 2, preferCanvas: true })
  .setView([9.7489, -83.7534], 11);

// Basemap raster público
L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    minZoom: 2,
    maxZoom: 22,
    maxNativeZoom: 13
  }
).addTo(map);

// Panes para controlar orden
map.createPane("pane-low");   map.getPane("pane-low").style.zIndex = 401;
map.createPane("pane-mid");   map.getPane("pane-mid").style.zIndex = 402;
map.createPane("pane-high");  map.getPane("pane-high").style.zIndex = 403;

// ===== Superposiciones Esri Leaflet =====
const buffer60m = L.esri.featureLayer({
  url: "https://services5.arcgis.com/LF48CxpifRE4aglv/arcgis/rest/services/Buffer_60m/FeatureServer/0",
  pane: "pane-mid",
  style: () => ({ color: "#00C5FF", weight: 1.5, fillColor: "#98D27D", fillOpacity: 0.49 })
});

const territoriosIndigenas = L.esri.featureLayer({
  url: "https://services5.arcgis.com/LF48CxpifRE4aglv/arcgis/rest/services/Terrirtorios_Indigenas_CR_2022_PV/FeatureServer/0",
  pane: "pane-low",
  style: () => ({ color: "#267300", weight: 1.5, fillColor: "#98D27D", fillOpacity: 0.49 })
});

const areasProtegidas = L.esri.featureLayer({
  url: "https://services5.arcgis.com/LF48CxpifRE4aglv/arcgis/rest/services/ASP_No_Cultivo/FeatureServer/0",
  pane: "pane-low",
  style: () => ({ color: "#F57A7A", weight: 1.5, fillColor: "#F0DFD8", fillOpacity: 0.49 })
});

const coberturaForestal = L.esri.featureLayer({
  url: "https://services5.arcgis.com/LF48CxpifRE4aglv/arcgis/rest/services/Cobertura_Forestal_2023/FeatureServer/0",
  pane: "pane-low",
  style: () => ({ color: "#38A800", weight: 0.7, fillColor: "#C6E2B2", fillOpacity: 0.5 })
});

const tmf2024 = L.esri.featureLayer({
  url: "https://services5.arcgis.com/LF48CxpifRE4aglv/arcgis/rest/services/TMF_2024/FeatureServer/0",
  pane: "pane-high"
});

// GFW
const gfwCR = L.esri.featureLayer({
  url: "https://services5.arcgis.com/LF48CxpifRE4aglv/arcgis/rest/services/GFW_CR/FeatureServer/0",
  pane: "pane-high"
});

// Agrega las que quieras ver de inicio
//gfwCR.addTo(map);// visible al cargar
//tmf2024.addTo(map);  
// buffer60m.addTo(map);
// territoriosIndigenas.addTo(map);
// areasProtegidas.addTo(map);
// coberturaForestal.addTo(map);

// Ajusta a la extensión del GFW cuando cargue
gfwCR.once("load", () => {
  const b = gfwCR.getBounds();
  if (b && b.isValid()) map.fitBounds(b);
});

// Popups (verifica nombres de campos)
buffer60m.bindPopup(l => {
  const p = l.feature.properties;
  return `<b>Buffer 60 m</b><br>ID_Finca: ${p.ID ?? "—"}`;
});

territoriosIndigenas.bindPopup(l => {
  const p = l.feature.properties;
  return `<b>Territorio Indígena</b><br>${p.TERRITORIO ?? "—"}`;
});

areasProtegidas.bindPopup(l => {
  const p = l.feature.properties;
  return `<b>Área Protegida</b><br>${p.cat_manejo ?? "—"}<br>${p.nombre_asp ?? "—"}`;
});

coberturaForestal.bindPopup(l => {
  const p = l.feature.properties;
  return `<b>Cobertura Forestal</b><br>${p.Clase ?? "—"}`;
});

tmf2024.bindPopup(l => {
  const p = l.feature.properties;
  return `<b>TMF</b><br>${p.Alerta ?? p.ALERTA ?? "—"}`; // ejemplo doble intento
});

gfwCR.bindPopup(l => {
  const p = l.feature.properties;
  return `<b>Global Forest Watch</b><br><b>Año:</b> ${p.Ano ?? p.ANO ?? "—"}<br><b>Confianza:</b> ${p.Confianza ?? p.CONFIANZA ?? "—"}`;
});

// Control de capas
const overlays = {
  "Buffer 60 m": buffer60m,
  "TMF 2024": tmf2024,
  "Global Forest Watch": gfwCR,
  "Territorios Indígenas": territoriosIndigenas,
  "Áreas Protegidas": areasProtegidas,
  "Cobertura Forestal": coberturaForestal
};
L.control.layers(null, overlays, { collapsed: false }).addTo(map);

// Enfocar a Costa Rica (si TMF no trae bounds válidos)
const COSTA_RICA_BOUNDS = L.latLngBounds([8.0, -86.0], [11.5, -82.5]);
map.fitBounds(COSTA_RICA_BOUNDS.pad(0.02));

// Escala
L.control.scale({ imperial: false }).addTo(map);
