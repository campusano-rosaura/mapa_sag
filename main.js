var app = new Vue({
    el: '#app',
    data: {
        country: '',
        products: [],
        modal_visible: false
    },

})


function join(lookupTable, mainTable, lookupKey, mainKey, select) {
    var l = lookupTable.length,
        m = mainTable.length,
        lookupIndex = [],
        output = [];
    for (var i = 0; i < l; i++) { // loop through l items
        var row = lookupTable[i];
        lookupIndex[row[lookupKey]] = row; // create an index for lookup table
    }
    for (var j = 0; j < m; j++) { // loop through m items
        var y = mainTable[j];
        var x = lookupIndex[y[mainKey]]; // get corresponding row from lookupTable
        output.push(select(y, x)); // select only the columns you need
    }
    return output;
};

d3.xml("world.svg").mimeType("image/svg+xml").get(function(error, xml) {
  if (error) throw error;
  var map = document.getElementById('map');
  svg = xml.documentElement;
  map.appendChild(svg);
  d3.csv("codes_names.csv", function(data) {
      var codes = data;
      var processFile = function(filename, clase) {
          d3.csv(filename, function(data2) {
              var sag_data = data2;
              var merged = join(codes, sag_data, 'nombre', 'Pais', function(sag, code) {
                  return {
                      pais: sag.Pais,
                      code: (code !== undefined) ? code.iso2 : null,
                      producto: sag.Producto,
                      clase: clase,
                      status: sag.Estado,
                      tipo: sag.Tipo,
                      fecha: sag['Fecha apertura']
                  }
              });
              merged.forEach(function(v) {
                  var elem = $('svg #' + v.code);
                  elem.addClass('active');
                  elem.attr('name_esp', v.pais);
                  if(v.status.includes('Finalizado') | v.status.includes('Abierto')) {
                      elem.addClass('highlight');
                  }
                  if(!data_merged.hasOwnProperty(v.code)) {
                      data_merged[v.code] = {
                          name: v.pais,
                          products: [{name: v.producto, class: v.clase, status: v.status, tipo: v.tipo, fecha: v.fecha}]
                      };
                  } else {
                      var to_insert = {name: v.producto, class: v.clase, status: v.status, tipo: v.tipo, fecha: v.fecha};
                      data_merged[v.code].products.push(to_insert);
                  }
              })
          });
      };
      processFile('data_agr.csv', 'Agrícola');
      processFile('data_pec.csv', 'Pecuaria');
      $('svg path').on('mouseover', function(e) {
          var country = $(e.target).attr('name_esp');
          if(country) {
            $('.notification').show().text(country);
          }
      });
      $('svg path').on('mouseleave', function(e) {
          $('.notification').hide();
      });
  });
});

var svg = d3.select(document.getElementById('map'));

svg.on('click', function() {
    var id = $(event.target).attr('id');
    var name = $(event.target).attr('title');
    var data = data_merged[id];
    if(data) {
        app.country = data.name;
        app.products = data.products;
        app.modal_visible = true;
    };
});

var data_merged = {};
