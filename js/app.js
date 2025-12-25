// Application initialization and event handling
// Initializes the calculator UI, wires form submission and renders results

document.addEventListener('DOMContentLoaded', function() {
  // When DOM is ready: set up datalist, distance autofill and form handler

  // 1) Populate datalist of cities if CONFIG provides the function
  if (typeof CONFIG !== 'undefined' && typeof CONFIG.populateDatalist === 'function') {
    try { CONFIG.populateDatalist(); } catch (e) { console.warn('CONFIG.populateDatalist failed', e); }
  }

  // 2) Enable auto-distance feature if provided by CONFIG
  if (typeof CONFIG !== 'undefined' && typeof CONFIG.setupDistanceAutofill === 'function') {
    try { CONFIG.setupDistanceAutofill(); } catch (e) { console.warn('CONFIG.setupDistanceAutofill failed', e); }
  }

  // 3) Get the calculator form element
  var calculatorForm = document.getElementById('calculator-form');
  if (!calculatorForm) {
    console.error('Calculator form not found: #calculator-form');
    return;
  }

  // 4) Attach submit event listener
  calculatorForm.addEventListener('submit', function(event) {
    // Prevent native form submission
    event.preventDefault();

    // Read form values with descriptive names
    var originInput = document.getElementById('origin');
    var destinationInput = document.getElementById('destination');
    var distanceInput = document.getElementById('distance');

    var origin = originInput ? (originInput.value || '').trim() : '';
    var destination = destinationInput ? (destinationInput.value || '').trim() : '';
    var distanceKm = distanceInput ? parseFloat(distanceInput.value) : NaN;

    var transportRadio = calculatorForm.querySelector('input[name="transport"]:checked');
    var transportMode = transportRadio ? transportRadio.value : null;

    // Validate inputs: origin, destination, distance and transport mode
    if (!origin || !destination) {
      window.alert('Por favor preencha origem e destino.');
      return;
    }
    if (!transportMode) {
      window.alert('Por favor selecione o modo de transporte.');
      return;
    }
    if (!distanceKm || isNaN(distanceKm) || distanceKm <= 0) {
      window.alert('Distância inválida. Certifique-se de que a distância seja maior que 0.');
      return;
    }

    // Get submit button and show loading state
    var submitButton = calculatorForm.querySelector('button[type="submit"]');
    UI.showLoading(submitButton);

    // Hide previous result sections (hide the section wrappers)
    UI.hideElement('results');
    UI.hideElement('comparison');
    UI.hideElement('carbon-credits');

    // Simulate processing delay (e.g., network or computation)
    setTimeout(function() {
      console.debug('Processing calculation for', { origin: origin, destination: destination, distanceKm: distanceKm, transportMode: transportMode });
      try {
        // Calculate emission for selected transport mode
        var emissionKg = Calculator.calculateEmission(distanceKm, transportMode);

        // Calculate baseline car emission
        var carBaselineKg = Calculator.calculateEmission(distanceKm, 'car');

        // Calculate savings compared to car
        var savings = Calculator.calculateSavings(emissionKg, carBaselineKg);

        // Calculate emissions for all modes for comparison UI
        var modesComparison = Calculator.calculateAllModes(distanceKm);

        // Calculate carbon credits needed and price estimate
        var credits = Calculator.calculateCarbonCredits(emissionKg);
        var priceEstimate = Calculator.estimateCreditPrice(credits);

        // Build data objects for rendering
        var resultsData = {
          origin: origin,
          destination: destination,
          distance: distanceKm,
          emission: emissionKg,
          mode: transportMode,
          savings: savings
        };

        var creditsData = {
          credits: credits,
          price: priceEstimate
        };

        // Render HTML and set into page (if content containers exist)
        var resultsContainer = document.getElementById('results-content');
        if (resultsContainer) {
          resultsContainer.innerHTML = UI.renderResults(resultsData);
          console.debug('results-content innerHTML length:', resultsContainer.innerHTML.length);
        } else {
          console.warn('results-content container not found');
        }

        var comparisonContainer = document.getElementById('comparison-content');
        if (comparisonContainer) {
          comparisonContainer.innerHTML = UI.renderComparion(modesComparison, transportMode);
          console.debug('comparison-content innerHTML length:', comparisonContainer.innerHTML.length);
        } else {
          console.warn('comparison-content container not found');
        }

        var creditsContainer = document.getElementById('carbon-credits-content');
        if (creditsContainer) {
          creditsContainer.innerHTML = UI.renderCarbonCredits(creditsData);
          console.debug('carbon-credits-content innerHTML length:', creditsContainer.innerHTML.length);
        } else {
          console.warn('carbon-credits-content container not found');
        }

        // Show the section wrappers (removes 'hidden' class)
        UI.showElement('results');
        UI.showElement('comparison');
        UI.showElement('carbon-credits');

        // Scroll to results section for better UX
        UI.scrollToElement('results');
        console.debug('Rendered results and comparison, credits:', { emissionKg: emissionKg, credits: credits });
      } catch (err) {
        console.error('Error during calculation/rendering', err);
        window.alert('Ocorreu um erro ao calcular as emissões. Tente novamente.');
      } finally {
        // Ensure button state is always restored
        try { UI.hideLoading(submitButton); } catch (hideErr) { console.warn('hideLoading failed', hideErr); }
      }
    }, 1500);
  });

  // Log initialization success
  console.log('✅ Calculadora inicializada!');
});
// Inicialização e eventos