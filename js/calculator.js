/* Global Calculator object
 * Provides emissions calculations using CONFIG values.
 * Defines one global variable: Calculator
 */
var Calculator = {

  // Calculate emission (kg CO2e) for a given distance (km) and transport mode
  calculateEmission: function(distanceKm, transportMode) {
    // Get emission factor (kg CO2e per km) from CONFIG
    var factor = (typeof CONFIG !== 'undefined' && CONFIG.EMISSION_FACTORS)
      ? CONFIG.EMISSION_FACTORS[transportMode]
      : undefined;

    if (typeof factor === 'undefined' || factor === null) {
      // Unknown mode: return 0
      return 0;
    }

    // Emission = distance * factor
    var emission = Number(distanceKm) * Number(factor);

    // Round to 2 decimal places and return as Number
    return Number(emission.toFixed(2));
  },

  // Calculate emissions for all transport modes and compare vs car baseline
  calculateAllModes: function(distanceKm) {
    var results = [];

    if (typeof CONFIG === 'undefined' || !CONFIG.EMISSION_FACTORS) {
      return results;
    }

    var modes = Object.keys(CONFIG.EMISSION_FACTORS);

    // Baseline car emission (if available)
    var carEmission = modes.indexOf('car') !== -1
      ? this.calculateEmission(distanceKm, 'car')
      : null;

    modes.forEach(function(mode) {
      // Calculate emission for this mode
      var emission = Calculator.calculateEmission(distanceKm, mode);

      // Calculate percentage vs car baseline. If car baseline not available or zero, set to null
      var percentageVsCar = null;
      if (carEmission !== null && carEmission !== 0) {
        percentageVsCar = Number(((emission / carEmission) * 100).toFixed(2));
      }

      results.push({
        mode: mode,
        emission: emission,
        percentageVsCar: percentageVsCar
      });
    });

    // Sort array by emission (lowest first)
    results.sort(function(a, b) { return a.emission - b.emission; });

    return results;
  },

  // Calculate savings between a baseline emission and a given emission
  calculateSavings: function(emission, baselineEmission) {
    // Saved kg CO2e
    var saved = Number(baselineEmission) - Number(emission);

    // If baseline is zero or negative, avoid division by zero
    var percentage = null;
    if (Number(baselineEmission) > 0) {
      percentage = (saved / Number(baselineEmission)) * 100;
    }

    // Round values to 2 decimals
    return {
      savedKg: Number(saved.toFixed(2)),
      percentage: percentage === null ? null : Number(percentage.toFixed(2))
    };
  },

  // Calculate how many carbon credits are needed for a given emission (kg)
  calculateCarbonCredits: function(emissionKg) {
    if (typeof CONFIG === 'undefined' || !CONFIG.CARBON_CREDIT || !CONFIG.CARBON_CREDIT.KG_PER_CREDIT) {
      return 0;
    }

    // Credits = emission (kg) / kg per credit
    var credits = Number(emissionKg) / Number(CONFIG.CARBON_CREDIT.KG_PER_CREDIT);

    // Return rounded to 4 decimal places
    return Number(credits.toFixed(4));
  },

  // Estimate price range for given number of credits
  estimateCreditPrice: function(credits) {
    if (typeof CONFIG === 'undefined' || !CONFIG.CARBON_CREDIT) {
      return { min: 0, max: 0, average: 0 };
    }

    // Calculate min, max using configured prices
    var min = Number(credits) * Number(CONFIG.CARBON_CREDIT.PRICE_MIN_BRL || 0);
    var max = Number(credits) * Number(CONFIG.CARBON_CREDIT.PRICE_MAX_BRL || 0);

    // Average price
    var average = (min + max) / 2;

    // Round to 2 decimals
    return {
      min: Number(min.toFixed(2)),
      max: Number(max.toFixed(2)),
      average: Number(average.toFixed(2))
    };
  }
};
// Lógica de cálculos (funções globais)