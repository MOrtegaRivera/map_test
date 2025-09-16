// Inicializamos el mapa
const map = L.map("map", { minZoom: 2 }).setView([9.7489, -83.7534], 11);

// Basemap raster público
L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    minZoom: 2,
    maxZoom: 22,
    maxNativeZoom: 13,
  }
).addTo(map);

// ===== Superposiciones Esri Leaflet (requiere esri-leaflet.js cargado) =====
const buffer60m = L.esri.featureLayer({
  url: "https://services5.arcgis.com/LF48CxpifRE4aglv/arcgis/rest/services/Buffer_60m/FeatureServer/0",
  style: () => ({ color: "#00C5FF", weight: 1.5, fillColor: "#98D27D", fillOpacity: 0.49 })
});

const territoriosIndigenas = L.esri.featureLayer({
  url: "https://services5.arcgis.com/LF48CxpifRE4aglv/arcgis/rest/services/Terrirtorios_Indigenas_CR_2022_PV/FeatureServer/0",
  style: () => ({ color: "#267300", weight: 1.5, fillColor: "#98D27D", fillOpacity: 0.49 })
});

const areasProtegidas = L.esri.featureLayer({
  url: "https://services5.arcgis.com/LF48CxpifRE4aglv/arcgis/rest/services/ASP_No_Cultivo/FeatureServer/0",
  style: () => ({ color: "#F57A7A", weight: 1.5, fillColor: "#F0DFD8", fillOpacity: 0.49 })
});

const coberturaForestal = L.esri.featureLayer({
  url: "https://services5.arcgis.com/LF48CxpifRE4aglv/arcgis/rest/services/Cobertura_Forestal_2023/FeatureServer/0",
  style: () => ({ color: "#38A800", weight: 0.7, fillColor: "#C6E2B2", fillOpacity: 0.5 })
});

const tmf2024 = L.esri.featureLayer({
  url: "https://services5.arcgis.com/LF48CxpifRE4aglv/arcgis/rest/services/TMF_2024/FeatureServer/0"
});

tmf2024.once("load", () => map.fitBounds(tmf2024.getBounds()));

const gfwCR = L.esri.featureLayer({
  url: "https://services5.arcgis.com/LF48CxpifRE4aglv/arcgis/rest/services/GFW_CR/FeatureServer/0",
  style: () => ({ color: "#C500FF", weight: 1, fillColor: "#A900E6", fillOpacity: 0.5 })
});

/*TMF tiles (overlay)
const tmfTile2024 = L.esri.tiledMapLayer({
  url: "https://tiles.arcgis.com/tiles/LF48CxpifRE4aglv/arcgis/rest/services/TMF_2024_CR/MapServer",
  maxZoom: 22,
  maxNativeZoom: 13,
}).addTo(map);

map.setMaxZoom(13);*/

// Popup directo por capa 
// buffer60m
buffer60m.bindPopup(function (layer) {
  const p = layer.feature.properties;
  return `
    <b>Buffer 60 m</b><br>
    ID_Finca: ${p.ID ?? "—"}<br>
  `;
});

// territoriosIndigenas
territoriosIndigenas.bindPopup(function (layer) {
  const p = layer.feature.properties;
  return `
    <b>Territorio Indigena: </b><br>
     ${p.TERRITORIO ?? "—"}<br>
  `;
});

// areasProtegidas
areasProtegidas.bindPopup(function (layer) {
  const p = layer.feature.properties;
  return `
    <b>Área Protegida: </b><br>
     ${p.cat_manejo ?? "—"}<br>
     ${p.nombre_asp ?? "—"}<br>
  `;
});


// coberturaForestal
coberturaForestal.bindPopup(function (layer) {
  const p = layer.feature.properties;
  return `
    <b>Cobertura Forestal: </b><br>
     ${p.Clase ?? "—"}<br>
  `;
});

// tmf2024
tmf2024.bindPopup(function (layer) {
  const p = layer.feature.properties;
  return `
    <b>TMF: </b><br>
     ${p.Alerta ?? "—"}<br>
  `;
});

// gfwCR
gfwCR.bindPopup(function (layer) {
  const p = layer.feature.properties;
  return `
    <b>Global Forest Watch: </b><br>
     <b>Año: </b>${p.Ano ?? "—"}<br>
     <b>Confianza: </b>${p.Confianza ?? "—"}<br>
  `;
});

const overlays = {
  "Buffer 60 m": buffer60m,
  "TMF 2024": tmf2024,
  "Global Forest Watch": gfwCR,
  "Territorios Indígenas": territoriosIndigenas,
  "Áreas Protegidas": areasProtegidas,
  "Cobertura Forestal": coberturaForestal
  //"TMF 2024 (Tiles)": tmfTile2024
};
L.control.layers(null, overlays, { collapsed: false }).addTo(map);

// Enfocar a Costa Rica
const COSTA_RICA_BOUNDS = L.latLngBounds([8.0, -86.0], [11.5, -82.5]);
map.fitBounds(COSTA_RICA_BOUNDS.pad(0.02));

// Escala
L.control.scale({ imperial: false }).addTo(map);
