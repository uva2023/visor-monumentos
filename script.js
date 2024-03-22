var monumentos; // Definir monumentos como variable global

var tiposMonumentos = {
    "Casas Consistoriales": "fas fa-building",
    "Casas Nobles": "fas fa-home",
    "Castillos": "fab fa-fort-awesome",
    "Catedrales": "fas fa-church",
    "Conjunto Etnológico": "fas fa-warehouse",
    "Cruceros": "fas fa-cross",
    "Esculturas": "fas fa-snowman",
    "Fuentes": "fas fa-faucet",
    "Hórreos": "fas fa-warehouse",
    "Iglesias y Ermitas": "fas fa-church",
    "Jardín Histórico": "fas fa-tree",
    "Molinos": "fas fa-fan",
    "Monasterios": "fas fa-church",
    "Murallas y puertas": "fas fa-archway",
    "Otros edificios": "fas fa-building",
    "Palacios": "fas fa-place-of-worship",
    "Paraje pintoresco": "fas fa-mountain",
    "Plazas Mayores": "fas fa-vector-square",
    "Puentes": "fas fa-road",
    "Reales Sitios": "fas fa-crown",
    "Santuarios": "fas fa-place-of-worship",
    "Sinagogas": "fas fa-synagogue",
    "Sitio Histórico": "fas fa-landmark",
    "Torres": "fas fa-chess-rock",
    "Yacimientos arqueológicos": "fas fa-archway"
};

var myChart1;
//var myChart2;

// Variable para almacenar los marcadores
var marcadores = L.markerClusterGroup();

var provincias = [];
var municipios = [];
var tipos = [];

document.addEventListener("DOMContentLoaded", function () {
    // Crear mapa
    var map = L.map('map').setView([40.416775, -3.703790], 6);

    // Añadir capa de mapa base
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
    }).addTo(map);


    // Función para agregar marcadores
    function agregarMarcadores(monumentosData) {
        marcadores.clearLayers();
    
        monumentosData.forEach(function (monumento) {
            var icono = tiposMonumentos[monumento.tipomonumento] || ''; // Icono por defecto en caso de no encontrar uno específico
    
            var marker = L.marker([monumento.coordenadas_latitud, monumento.coordenadas_longitud], {
                icon: L.divIcon({
                    html: '<i class="' + icono + '"></i>',
                    iconSize: [64, 64], // Tamaño del icono
                    iconAnchor: [32, 64], // Punto de anclaje del icono, coincidiendo con la parte inferior del marcador
                    className: 'custom-marker' // Clase de estilo personalizado para el marcador
                })
            });
    
            marker.bindPopup('<b>' + monumento.nombre + '</b><br>' +
                'Población: ' + monumento.poblacion_municipio + ', ' + monumento.poblacion_provincia + '<br>' +
                'Coordenadas: ' + monumento.coordenadas_latitud + ', ' + monumento.coordenadas_longitud);
    
            marker.on('click', function () {
                mostrarInformacionMonumento(monumento);
            });
    
            marcadores.addLayer(marker);
        });
    
        map.addLayer(marcadores);
    }

    function cargarProvincias(provincias) {
        var provinciaSelect = document.getElementById("provinciaSelect");

        provincias.results.forEach(function(provinciaData) {
            var provincia = provinciaData.provincia;
            var option = document.createElement("option");
            option.value = provincia;
            option.textContent = provincia;
            provinciaSelect.appendChild(option);
        });
    }

    function cargarTipos(tipos) {
        var tipoSelect = document.getElementById("tipoSelect");

        tipos.results.forEach(function(tipoData) {
            var tipo = tipoData.tipomonumento;
            var option = document.createElement("option");
            option.value = tipo;
            option.textContent = tipo;
            tipoSelect.appendChild(option);
        });
    }

    function cargarMunicipios() {
        const provincia = document.getElementById('provinciaSelect').value;
    
        fetch(`https://analisis.datosabiertos.jcyl.es/api/explore/v2.1/catalog/datasets/registro-de-municipios-de-castilla-y-leon/records?select=municipio&where=provincia%20like%20%27${provincia}%27&group_by=municipio&limit=-1`)
            .then(response => response.json())
            .then(data => {
                municipios = data;
    
                const municipioSelect = document.getElementById('municipioSelect');
                
                // Limpiar el select antes de agregar los nuevos municipios
                municipioSelect.innerHTML = '';
    
                // Agregar la opción "Selecciona un municipio"
                var selectOption = document.createElement("option");
                selectOption.value = "";
                selectOption.textContent = "Selecciona un municipio";
                municipioSelect.appendChild(selectOption);
    
                municipios.results.forEach(function(municipioData) {
                    var municipio = municipioData.municipio;
                    var option = document.createElement("option");
                    option.value = municipio;
                    option.textContent = municipio;
                    municipioSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error al cargar los municipios:', error);
            });
    }

    document.getElementById('provinciaSelect').addEventListener('change', cargarMunicipios);

    // Función para obtener los datos de la API
    function obtenerDatos() {
        //fetch('https://analisis.datosabiertos.jcyl.es/api/explore/v2.1/catalog/datasets/relacion-monumentos/records?limit=-1')
        fetch('relacion-monumentos.json')
            .then(response => response.json())
            .then(data => {
                monumentos = data; // Asignar los datos a la variable global monumentos
                console.log(monumentos)
                agregarMarcadores(monumentos);
                mostrarTotalMonumentos(monumentos);
                mostrarMonumentosNombres(monumentos);
                crearGraficoTiposMonumentoBarras(monumentos);
            })
            .catch(error => {
                console.error('Error al obtener los datos:', error);
            });

        fetch('https://analisis.datosabiertos.jcyl.es/api/explore/v2.1/catalog/datasets/registro-de-municipios-de-castilla-y-leon/records?select=provincia&group_by=provincia&limit=-1')
        .then(response => response.json())
        .then(data => {
            provincias = data; // Asignar los datos a la variable global monumentos
            console.log(provincias)
            cargarProvincias(provincias)
        })
        .catch(error => {
            console.error('Error al obtener los datos:', error);
        });

        fetch('https://analisis.datosabiertos.jcyl.es/api/explore/v2.1/catalog/datasets/relacion-monumentos/records?select=tipomonumento&group_by=tipomonumento&limit=-1')
        .then(response => response.json())
        .then(data => {
            tipos = data; // Asignar los datos a la variable global monumentos
            console.log(tipos)
            cargarTipos(tipos)
        })
        .catch(error => {
            console.error('Error al obtener los datos:', error);
        });
    }

    // Función para mostrar información del monumento seleccionado
    function mostrarInformacionMonumento(monumento) {
        ocultarTotalMonumentos()

        var infoMonumento = document.getElementById('info');
        infoMonumento.innerHTML = ''; // Limpiar cualquier contenido existente en el div 'info'
        infoMonumento.innerHTML = '<h2>' + monumento.nombre + ' ('  + monumento.poblacion_municipio + ', ' + monumento.poblacion_provincia + ')' + '</h2>';
        // Verificar si monumento.calle no es nulo ni está indefinido
        if (monumento.calle !== null && monumento.calle !== undefined) {
            // Agregar la dirección al HTML
            infoMonumento.innerHTML += '<p class="text-justify"> Dirección: ' + monumento.calle + '</p>';
        }
       infoMonumento.innerHTML += '<p class="text-justify">' + monumento.descripcion + '</p>';
    }

    // Función para mostrar el total de monumentos
    function mostrarTotalMonumentos(monumentosData) {
        var totalElemento = document.getElementById('total-monumentos');
        totalElemento.style.display = 'block'; // Asegurarse de que esté visible
        totalElemento.textContent = 'Total de monumentos: ' + monumentosData.length;
    }

    // Función para ocultar el total de monumentos
    function ocultarTotalMonumentos() {
        var totalElemento = document.getElementById('total-monumentos');
        totalElemento.style.display = 'none'; // Ocultar el elemento
    }

var startIndex = 0; // Índice inicial para mostrar los monumentos

// Función para mostrar la lista de monumentos
function mostrarMonumentosNombres(monumentosData) {
    var listaNombres = document.createElement('ul'); // Crear una lista desordenada
    listaNombres.id = 'lista-nombres'; // Asignar un ID a la lista

    // Iterar sobre los 10 monumentos a mostrar
    for (var i = startIndex; i < Math.min(startIndex + 10, monumentosData.length); i++) {
        var monumento = monumentosData[i]; // Obtener el monumento en la posición actual

        var listItem = document.createElement('li'); // Crear un elemento de lista
        listItem.textContent = monumento.nombre; // Establecer el texto del elemento de lista
        listItem.addEventListener('click', function() { // Agregar un evento de clic al elemento de lista
            // Centrar el mapa en las coordenadas del monumento
            map.setView([monumento.coordenadas_latitud, monumento.coordenadas_longitud], 15);
            // Mostrar la información del monumento en el panel de información
            mostrarInformacionMonumento(monumento);
        });
        listaNombres.appendChild(listItem); // Agregar el elemento de lista a la lista desordenada
    }

    var infoDiv = document.getElementById('info'); // Obtener el div 'info'
    infoDiv.innerHTML = ''; // Limpiar cualquier contenido existente en el div 'info'
    infoDiv.appendChild(listaNombres); // Agregar la lista desordenada al div 'info'

    // Mostrar un botón para cargar más monumentos si quedan más de 10 por mostrar
    if (startIndex + 10 < monumentosData.length) {
        var cargarMasButton = document.createElement('button'); // Crear un botón
        cargarMasButton.textContent = 'Cargar más'; // Establecer el texto del botón
        cargarMasButton.className = 'bg-primary border-primary-500 px-3 py-2 text-base border-1 border-solid border-round cursor-pointer transition-all transition-duration-200 hover:bg-primary-600 hover:border-primary-600 active:bg-primary-700 active:border-primary-700'; // Agregar la clase CSS al botón
        cargarMasButton.addEventListener('click', function() { // Agregar un evento de clic al botón
            startIndex += 10; // Incrementar el índice inicial
            mostrarMonumentosNombres(monumentosData); // Volver a mostrar la lista de monumentos
        });
        infoDiv.appendChild(cargarMasButton); // Agregar el botón al div 'info'
    }
}

    // Función para filtrar monumentos
    function filtrarMonumentos() {
        var provincia = document.getElementById('provinciaSelect').value.toLowerCase();
        var municipio = document.getElementById('municipioSelect').value.toLowerCase();
        var descripcion = document.getElementById('descripcionInput').value.toLowerCase();
        var tipomonumento = document.getElementById('tipoSelect').value.toLowerCase();

        //var monumentosFiltrados = monumentos.results.filter(function (monumento) {
        var monumentosFiltrados = monumentos.filter(function (monumento) {

            var provinciaValida = !provincia || (monumento.poblacion_provincia && monumento.poblacion_provincia.toLowerCase().includes(provincia));
            var municipioValido = !municipio || (monumento.poblacion_municipio && monumento.poblacion_municipio.toLowerCase().includes(municipio));
            var descripcionValida = !descripcion || (monumento.descripcion && monumento.descripcion.toLowerCase().includes(descripcion));
            var tipomonumentoValido = !tipomonumento || (monumento.tipomonumento && monumento.tipomonumento.toLowerCase().includes(tipomonumento));

            return provinciaValida && municipioValido && descripcionValida && tipomonumentoValido;
        });
        console.log(monumentosFiltrados)
        //var resultsFiltados = { total_count: monumentosFiltrados.length,
        //                        results: monumentosFiltrados };
        console.log(monumentosFiltrados)
        agregarMarcadores(monumentosFiltrados); // Agregar marcadores filtrados
        mostrarTotalMonumentos(monumentosFiltrados);
        mostrarMonumentosNombres(monumentosFiltrados);
        crearGraficoTiposMonumentoBarras(monumentosFiltrados);
       // crearGraficoTiposMonumentoLineas(monumentosFiltrados);
    }

    // Función para crear el gráfico de monumentos por tipo
    function crearGraficoTiposMonumentoBarras(monumentosData) {

        if (myChart1) {
            myChart1.destroy();
        }
    
        var tiposMonumento = {}; // Objeto para almacenar la cantidad de monumentos por tipo
    
        // Contar la cantidad de monumentos por tipo
        monumentosData.forEach(function(monumento) {
            var tipo = monumento.tipomonumento;
            tiposMonumento[tipo] = tiposMonumento[tipo] ? tiposMonumento[tipo] + 1 : 1;
        });
    
        // Configuración de los datos del gráfico
        var data = {
            labels: Object.keys(tiposMonumento),
            datasets: [
                {
                    label: 'Número de monumentos (Barras)',
                    data: Object.values(tiposMonumento),
                    backgroundColor: "#686868",
                    borderColor: "#686868",
                    borderWidth: 1,
                    type: 'bar' // Tipo de gráfico: barras
                },
                {
                    label: 'Número de monumentos (Línea)',
                    data: Object.values(tiposMonumento),
                    borderColor: "#686868",
                    borderWidth: 2,
                    type: 'line' // Tipo de gráfico: línea
                }
            ]
        };
    
        // Configuración del gráfico
        var options = {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            responsive: true, // Hacer el gráfico responsive
            maintainAspectRatio: false // Permitir que el gráfico se ajuste al contenedor sin mantener una relación de aspecto fija
        };
    
        // Obtener el contexto del canvas
        var ctx = document.getElementById('myChart1').getContext('2d');
    
        // Crear el gráfico mixto de barras y líneas
        myChart1 = new Chart(ctx, {
            type: 'bar', // Tipo de gráfico inicial: barras
            data: data,
            options: options
        });
    }

    // Función para limpiar filtros y obtener los datos sin filtrar
    function limpiarFiltros() {
        // Limpiar valores de los elementos de filtro
        const provinciaSelect = document.getElementById('provinciaSelect');
        provinciaSelect.innerHTML = '';

        provinciaSelect.value = '';

        const municipioSelect = document.getElementById('municipioSelect');
        // Limpiar la lista desplegable de municipios
        municipioSelect.innerHTML = '';
        municipioSelect.value = '';

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Selecciona un municipio';
        municipioSelect.appendChild(defaultOption);

        document.getElementById('descripcionInput').value = '';
        document.getElementById('tipoSelect').value = '';

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
