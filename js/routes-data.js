/*
  RoutesDB - simple in-memory routes database

  Structure:
  - RoutesDB.routes: array of route objects
      { origin: 'City, ST', destination: 'City, ST', distanceKm: 123 }
  - RoutesDB.getAllCities(): returns unique, alphabetically sorted array of city names
  - RoutesDB.findDistance(origin, destination): returns distance in km (number) if route found, or null if not found

  One global variable is defined: RoutesDB
*/

var RoutesDB = (function(){
  'use strict';

  var routes = [
    { origin: 'São Paulo, SP', destination: 'Rio de Janeiro, RJ', distanceKm: 430 },
    { origin: 'São Paulo, SP', destination: 'Brasília, DF', distanceKm: 1016 },
    { origin: 'Rio de Janeiro, RJ', destination: 'Brasília, DF', distanceKm: 1148 },
    { origin: 'São Paulo, SP', destination: 'Campinas, SP', distanceKm: 95 },
    { origin: 'Rio de Janeiro, RJ', destination: 'Niterói, RJ', distanceKm: 13 },
    { origin: 'Belo Horizonte, MG', destination: 'Ouro Preto, MG', distanceKm: 100 },
    { origin: 'Salvador, BA', destination: 'Feira de Santana, BA', distanceKm: 110 },
    { origin: 'Fortaleza, CE', destination: 'Sobral, CE', distanceKm: 235 },
    { origin: 'Porto Alegre, RS', destination: 'Curitiba, PR', distanceKm: 710 },
    { origin: 'Manaus, AM', destination: 'Belém, PA', distanceKm: 1120 },
    { origin: 'Recife, PE', destination: 'Natal, RN', distanceKm: 287 },
    { origin: 'João Pessoa, PB', destination: 'Maceió, AL', distanceKm: 310 },
    { origin: 'Goiânia, GO', destination: 'Brasília, DF', distanceKm: 209 },
    { origin: 'Fortaleza, CE', destination: 'Natal, RN', distanceKm: 307 },
    { origin: 'Salvador, BA', destination: 'Brasília, DF', distanceKm: 1410 },
    { origin: 'Curitiba, PR', destination: 'São Paulo, SP', distanceKm: 408 },
    { origin: 'Belo Horizonte, MG', destination: 'São Paulo, SP', distanceKm: 586 },
    { origin: 'Porto Alegre, RS', destination: 'São Paulo, SP', distanceKm: 1130 },
    { origin: 'Teresina, PI', destination: 'São Luís, MA', distanceKm: 332 },
    { origin: 'Florianópolis, SC', destination: 'Curitiba, PR', distanceKm: 300 },
    { origin: 'Vitória, ES', destination: 'Belo Horizonte, MG', distanceKm: 518 },
    { origin: 'Cuiabá, MT', destination: 'Campo Grande, MS', distanceKm: 800 },
    { origin: 'Macapá, AP', destination: 'Belém, PA', distanceKm: 520 },
    { origin: 'Porto Velho, RO', destination: 'Rio Branco, AC', distanceKm: 720 },
    { origin: 'Boa Vista, RR', destination: 'Manaus, AM', distanceKm: 750 },
    { origin: 'Palmas, TO', destination: 'Goiânia, GO', distanceKm: 780 },
    { origin: 'Recife, PE', destination: 'Salvador, BA', distanceKm: 810 },
    { origin: 'Natal, RN', destination: 'João Pessoa, PB', distanceKm: 185 },
    { origin: 'São Paulo, SP', destination: 'Santos, SP', distanceKm: 75 },
    { origin: 'Campinas, SP', destination: 'Ribeirão Preto, SP', distanceKm: 313 },
    { origin: 'Belo Horizonte, MG', destination: 'Uberlândia, MG', distanceKm: 540 },
    { origin: 'São Luís, MA', destination: 'Belém, PA', distanceKm: 635 },
    { origin: 'Vitória, ES', destination: 'Salvador, BA', distanceKm: 930 },
    { origin: 'Maceió, AL', destination: 'Aracaju, SE', distanceKm: 260 },
    { origin: 'Campina Grande, PB', destination: 'João Pessoa, PB', distanceKm: 120 }
  ];

  // Return unique sorted array of all cities (origin + destination)
  function getAllCities(){
    var set = new Set();
    for(var i=0;i<routes.length;i++){
      set.add(routes[i].origin);
      set.add(routes[i].destination);
    }
    var arr = Array.from(set);
    arr.sort(function(a,b){ return a.localeCompare(b, 'pt-BR'); });
    return arr;
  }

  // Find distance between two cities (search both directions)
  // Returns number (distance in km) if found, or null if not found
  function findDistance(origin, destination){
    if(!origin || !destination) return null;
    var o = origin.trim().toLowerCase();
    var d = destination.trim().toLowerCase();

    for(var i=0;i<routes.length;i++){
      var r = routes[i];
      var ro = r.origin.trim().toLowerCase();
      var rd = r.destination.trim().toLowerCase();
      if((ro === o && rd === d) || (ro === d && rd === o)){
        return r.distanceKm;
      }
    }
    return null;
  }

  return {
    routes: routes,
    getAllCities: getAllCities,
    findDistance: findDistance
  };
})();

/* Example usage:
   RoutesDB.getAllCities();
   RoutesDB.findDistance('São Paulo, SP', 'Rio de Janeiro, RJ');
*/
// Dados de rotas (objeto global)