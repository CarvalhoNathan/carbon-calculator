/*
  Global CONFIG object

  - CONFIG.EMISSION_FACTORS: kg CO2 per km for each transport mode
  - CONFIG.TRANSPORT_MODES: metadata for each mode (label, icon, color)
  - CONFIG.CARBON_CREDIT: credit definitions
  - CONFIG.populateDatalist(): populate <datalist id="cities-list"> from RoutesDB
  - CONFIG.setupDistanceAutofill(): wire origin/destination inputs and manual-distance checkbox

  Depends on global RoutesDB being available.
*/

var CONFIG = (function(){
  'use strict';

  var EMISSION_FACTORS = {
    bicycle: 0,
    car: 0.12,
    bus: 0.089,
    truck: 0.96
  };

  var TRANSPORT_MODES = {
    bicycle: { label: 'Bicicleta', icon: '🚲', color: '#10b981' },
    car:     { label: 'Carro',      icon: '🚗', color: '#059669' },
    bus:     { label: 'Ônibus',     icon: '🚌', color: '#3b82f6' },
    truck:   { label: 'Caminhão',   icon: '🚚', color: '#ef4444' }
  };

  var CARBON_CREDIT = {
    KG_PER_CREDIT: 1000,
    PRICE_MIN_BRL: 50,
    PRICE_MAX_BRL: 150
  };

  /* Populate datalist with cities from RoutesDB */
  function populateDatalist(){
    if(typeof RoutesDB === 'undefined' || !RoutesDB.getAllCities) return;
    var cities = RoutesDB.getAllCities();
    var datalist = document.getElementById('cities-list');
    if(!datalist) return;
    // Clear existing options
    datalist.innerHTML = '';
    cities.forEach(function(city){
      var opt = document.createElement('option');
      opt.value = city;
      datalist.appendChild(opt);
    });
  }

  /* Setup autofill logic for distance from RoutesDB and manual override */
  function setupDistanceAutofill(){
    var originEl = document.getElementById('origin');
    var destEl = document.getElementById('destination');
    var distanceEl = document.getElementById('distance');
    var manualChk = document.getElementById('manual-distance');
    var helper = document.getElementById('distance-help');

    if(!originEl || !destEl || !distanceEl || !manualChk || !helper) return;

    function setHelper(text, success){
      helper.textContent = text;
      if(success){
        helper.style.color = 'var(--primary)';
      } else {
        helper.style.color = '';
      }
    }

    function tryAutofill(){
      var o = originEl.value.trim();
      var d = destEl.value.trim();
      if(!o || !d) return;
      // If manual mode enabled, do not override
      if(manualChk.checked) return;
      if(typeof RoutesDB === 'undefined' || !RoutesDB.findDistance) return;

      var km = RoutesDB.findDistance(o, d);
      if(km !== null && typeof km === 'number'){
        distanceEl.value = km;
        distanceEl.readOnly = true;
        setHelper('A distância foi preenchida automaticamente', true);
      } else {
        distanceEl.value = '';
        distanceEl.readOnly = true;
        setHelper('Distância não encontrada — marque "Inserir distância manualmente" para digitar', false);
      }
    }

    // Event listeners
    originEl.addEventListener('change', tryAutofill);
    destEl.addEventListener('change', tryAutofill);

    // Also listen to input in case user types
    originEl.addEventListener('input', tryAutofill);
    destEl.addEventListener('input', tryAutofill);

    manualChk.addEventListener('change', function(){
      if(manualChk.checked){
        distanceEl.readOnly = false;
        setHelper('Você pode inserir a distância manualmente agora', false);
      } else {
        // revert to autofill attempt
        distanceEl.readOnly = true;
        tryAutofill();
      }
    });

    // Initial attempt
    tryAutofill();
  }

  return {
    EMISSION_FACTORS: EMISSION_FACTORS,
    TRANSPORT_MODES: TRANSPORT_MODES,
    CARBON_CREDIT: CARBON_CREDIT,
    populateDatalist: populateDatalist,
    setupDistanceAutofill: setupDistanceAutofill
  };

})();

/* Example usage (after DOM is ready):
   CONFIG.populateDatalist();
   CONFIG.setupDistanceAutofill();
*/
// Constantes CO2 (objeto global)