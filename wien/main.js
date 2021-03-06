let startLayer = L.tileLayer.provider("BasemapAT.grau");

let map = L.map("map", {
    center: [48.208333, 16.373056],
    zoom: 12,
    layers: [
        startLayer
    ]
});

let sightGroup = L.markerClusterGroup().addTo(map);
let walkGroup = L.featureGroup().addTo(map);
let heritageGroup = L.featureGroup().addTo(map);

L.control.layers({
    "BasemapAT.grau": startLayer,
    "BasemapAT": L.tileLayer.provider("BasemapAT"),
    "BasemapAT.highdpi": L.tileLayer.provider("BasemapAT.highdpi"),
    "BasemapAT.terrain": L.tileLayer.provider("BasemapAT.terrain"),
    "BasemapAT.surface": L.tileLayer.provider("BasemapAT.surface"),
    "BasemapAT.orthofoto": L.tileLayer.provider("BasemapAT.orthofoto"),
    "BasemapAT.overlay": L.tileLayer.provider("BasemapAT.overlay"),
    "BasemapAT.orthofoto+overlay": L.layerGroup([
        L.tileLayer.provider("BasemapAT.orthofoto"),
        L.tileLayer.provider("BasemapAT.overlay")
    ])
}, {
    "Stadtspaziergang (Punkte)": sightGroup,
    "Wanderungen": walkGroup,
    "Weltkulturerbe": heritageGroup

}).addTo(map);

let sightUrl = "https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:SPAZIERPUNKTOGD &srsName=EPSG:4326&outputFormat=json";

let sights = L.geoJson.ajax(sightUrl, {
    pointToLayer: function (point, latlng) {
        let siteIcon = L.icon({
            iconUrl: 'icons/sight.svg',
            iconSize: [32, 32]
        });
        let marker = L.marker(latlng, {
            icon: siteIcon
        });
        // console.log("Point", point);
        marker.bindPopup(`<h3>${point.properties.NAME}</h3>
        <p>${point.properties.BEMERKUNG || ""}</p>
        <p>Adresse: ${point.properties.ADRESSE}</p>
        <p><a target="links" href="${point.properties.WEITERE_INF}">Weiterführende Informationen</a></p>
        `);
        return marker;
    }
});

sights.on("data:loaded", function () {
    sightGroup.addLayer(sights);
    //console.log('data loaded!');
    map.fitBounds(sightGroup.getBounds());
});

let walkUrl = "https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:WANDERWEGEOGD&srsName=EPSG:4326&outputFormat=json";

L.geoJson.ajax(walkUrl, {
    style: function (feature) {
        if (feature.properties.TYP == "1") {
            return {
                color: "black",
                weight: 2,
                dashArray: "15 5"
            };
        } else {
            return {
                color: "black",
                weight: 2,
                dashArray: "1 5"
            };
        }
    },
    onEachFeature: function (feature, layer) {
        layer.bindPopup(`<p>${feature.properties.BEZ_TEXT}</p>`);
    }
}).addTo(walkGroup);

let heritageUrl = "https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:WELTKULTERBEOGD&srsName=EPSG:4326&outputFormat=json";

L.geoJson.ajax(heritageUrl, {
    style: function (feature) {
        if (feature.properties.TYP === "1") {
            return {
                color: "salmon",
                fillOpacity: 0.3
            };
        } else {
            return {
                color: "yellow",
                fillOpacity: 0.3
            };
        }
    },
    onEachFeature: function (feature, layer) {
        //console.log("Feature: ", feature);
        layer.bindPopup(`<h3>${feature.properties.NAME}</h3>
        <p>${feature.properties.INFO}</p>
        `);
    }
}).addTo(heritageGroup);