var monumentos; // Definir monumentos como variable global

var tiposMonumentos = {
    "Yacimientos arqueológicos": "fas fa-archway",
    "Monasterios": "fas fa-church",
    "Castillos": "fab fa-fort-awesome",
    // Agregar más tipos de monumentos..
};

var myChart;

document.addEventListener("DOMContentLoaded", function () {
    // Crear mapa
    var map = L.map('map').setView([40.416775, -3.703790], 6);

    // Añadir capa de mapa base
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Variable para almacenar los marcadores
    var marcadores = [];

    // Función para agregar marcadores
    function agregarMarcadores(monumentosData) {
        // Eliminar marcadores existentes antes de agregar nuevos
        marcadores.forEach(function(marker) {
            map.removeLayer(marker);
        });
        marcadores = [];

        monumentosData.results.forEach(function (monumento) {

            var icono = tiposMonumentos[monumento.tipomonumento];
            var marker = null;
            if (icono) {
                marker = L.marker([monumento.coordenadas_latitud, monumento.coordenadas_longitud], {
                    icon: L.divIcon({
                        html: '<i class="' + icono + '"></i>',
                        iconSize: [32, 32], // Tamaño del icono
                        iconAnchor: [16, 32], // Punto de anclaje del icono, coincidiendo con la parte inferior del marcador
                        className: 'custom-marker' // Clase de estilo personalizado para el marcador
                    })     
                }).addTo(map);
            } else {
                marker = L.marker([monumento.coordenadas_latitud, monumento.coordenadas_longitud], {
                    icon: L.divIcon({
                        html: '<i class="fas fa-map-marker-alt"></i>',
                        iconSize: [32, 32], // Tamaño del icono
                        iconAnchor: [16, 32], // Punto de anclaje del icono, coincidiendo con la parte inferior del marcador
                        className: 'custom-marker' // Clase de estilo personalizado para el marcador
                    })    
                }).addTo(map);
            }

            marker.bindPopup('<b>' + monumento.nombre + '</b><br>' + monumento.poblacion_municipio + ', ' + monumento.poblacion_provincia);
            marker.on('click', function () {
                mostrarInformacionMonumento(monumento);
            });
            marcadores.push(marker);
        });
    }

    // Función para obtener los datos de la API
    function obtenerDatos() {
        fetch('https://analisis.datosabiertos.jcyl.es/api/explore/v2.1/catalog/datasets/relacion-monumentos/records?limit=75')
            .then(response => response.json())
            .then(data => {
                monumentos = data; // Asignar los datos a la variable global monumentos
                console.log(monumentos)
                agregarMarcadores(monumentos);
                mostrarTotalMonumentos(monumentos);
                mostrarMonumentosNombres(monumentos);
                crearGraficoTiposMonumento(monumentos);
            })
            .catch(error => {
                console.error('Error al obtener los datos:', error);
            });
    }

    // Función para mostrar información del monumento seleccionado
    function mostrarInformacionMonumento(monumento) {
        var infoMonumento = document.getElementById('info');
        infoMonumento.innerHTML = ''; // Limpiar cualquier contenido existente en el div 'info'
        infoMonumento.innerHTML = '<h2>' + monumento.nombre + '</h2>' +
                                '<p>Provincia: ' + monumento.poblacion_provincia + '</p>' +
                                '<p>Municipio: ' + monumento.poblacion_municipio + '</p>' +
                                '<p class="text-justify">Descripción: ' + monumento.descripcion + '</p>';
    }

    

    // Función para mostrar el total de monumentos
    function mostrarTotalMonumentos(monumentosData) {
        var totalElemento = document.getElementById('total-monumentos');
        totalElemento.textContent = 'Total de monumentos: ' + monumentosData.total_count;
    }

    // Función para mostrar la lista de monumentos
    function mostrarMonumentosNombres(monumentosData) {
        monumentosNombres = monumentosData.results.map(monumento => monumento.nombre).slice(0, 10); // Obtener los nombres de los primeros 10 monumentos

        var listaNombres = document.createElement('lista-nombres');
        monumentosNombres.forEach(function(nombre) {
            var listItem = document.createElement('li');
            listItem.textContent = nombre;
            listaNombres.appendChild(listItem);
        });

        var infoDiv = document.getElementById('info'); // Obtener el div 'info'
        infoDiv.innerHTML = ''; // Limpiar cualquier contenido existente en el div 'info'
        infoDiv.appendChild(listaNombres);
    }

    // Función para filtrar monumentos
    function filtrarMonumentos() {
        var provincia = document.getElementById('provinciaInput').value.toLowerCase();
        var municipio = document.getElementById('municipioInput').value.toLowerCase();
        var descripcion = document.getElementById('descripcionInput').value.toLowerCase();
        var tipomonumento = document.getElementById('tipoInput').value.toLowerCase();

        var monumentosFiltrados = monumentos.results.filter(function (monumento) {
            return (monumento.poblacion_provincia.toLowerCase().includes(provincia) &&
                    monumento.poblacion_municipio.toLowerCase().includes(municipio) &&
                    monumento.descripcion.toLowerCase().includes(descripcion)) &&
                    monumento.tipomonumento.toLowerCase().includes(tipomonumento);
        });
        console.log(monumentosFiltrados)
        var resultsFiltados = { total_count: monumentosFiltrados.length,
                                results: monumentosFiltrados };
        console.log(resultsFiltados)
        agregarMarcadores(resultsFiltados); // Agregar marcadores filtrados
        mostrarTotalMonumentos(resultsFiltados);
        mostrarMonumentosNombres(resultsFiltados);
        crearGraficoTiposMonumento(resultsFiltados);
    }

    // Función para crear el gráfico de monumentos por tipo
    function crearGraficoTiposMonumento(monumentosData) {

        if (myChart) {
            myChart.destroy();
        }

        var tiposMonumento = {}; // Objeto para almacenar la cantidad de monumentos por tipo

        // Contar la cantidad de monumentos por tipo
        monumentosData.results.forEach(function(monumento) {
            var tipo = monumento.tipomonumento;
            tiposMonumento[tipo] = tiposMonumento[tipo] ? tiposMonumento[tipo] + 1 : 1;
        });

        // Configuración de los datos del gráfico
        var data = {
            labels: Object.keys(tiposMonumento),
            datasets: [{
                label: 'Número de monumentos',
                data: Object.values(tiposMonumento),
                backgroundColor: "#686868",
                borderColor: "#686868",
                borderWidth: 1
            }]
        };

        // Configuración del gráfico
        var options = {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        };

       // Obtener el contexto del canvas
        var ctx = document.getElementById('myChart').getContext('2d');

        // Crear el gráfico de barras
        myChart = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: options
        });
    }

    // Función para limpiar filtros y obtener los datos sin filtrar
    function limpiarFiltros() {
        // Limpiar valores de los elementos de filtro
        document.getElementById('provinciaInput').value = '';
        document.getElementById('municipioInput').value = '';
        document.getElementById('descripcionInput').value = '';
        document.getElementById('tipoInput').value = '';

        // Obtener nuevamente los datos sin filtrar
        obtenerDatos();
    }

    // Función para actualizar la página después de filtrar
    function actualizarPagina() {
        filtrarMonumentos();
    }

    // Llamar a la función para obtener los datos al cargar la página
    obtenerDatos();

    // Asignar la función de filtrado al evento click del botón
    var botonFiltrar = document.getElementById('boton-filtrar');
    botonFiltrar.addEventListener('click', actualizarPagina);

     // Asignar la función de limpiar filtrado al evento clik del botón
     var botonLimpiar = document.getElementById('boton-limpiar');
     botonLimpiar.addEventListener('click', limpiarFiltros);
});
