/* Global UI object
 * Contains utility formatting helpers and rendering methods that produce
 * HTML strings for results, comparisons and carbon credits.
 * Defines one global variable: UI
 */
var UI = {

  /* Utility methods */

  // Format a number with fixed decimals and pt-BR thousand separators
  formatNumber: function(number, decimals) {
    // Use toLocaleString to ensure pt-BR formatting and exact decimal places
    var n = Number(number) || 0;
    return n.toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  },

  // Format a value as Brazilian Real currency (R$ 1.234,56)
  formatCurrency: function(value) {
    var v = Number(value) || 0;
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  },

  // Show element by removing 'hidden' class
  showElement: function(elementId) {
    var el = document.getElementById(elementId);
    if (!el) return;
    el.classList.remove('hidden');
  },

  // Hide element by adding 'hidden' class
  hideElement: function(elementId) {
    var el = document.getElementById(elementId);
    if (!el) return;
    el.classList.add('hidden');
  },

  // Smoothly scroll to an element
  scrollToElement: function(elementId) {
    var el = document.getElementById(elementId);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  /* Rendering methods
   * Each render method returns an HTML string (safe for innerHTML insertion)
   */

  // Render the main results cards for a single route/result
  // data: { origin, destination, distance, emission, mode, savings }
  renderResults: function(data) {
    // Mode metadata comes from CONFIG.TRANSPORT_MODES, expected shape:
    // CONFIG.TRANSPORT_MODES[mode] = { icon: '🚗', label: 'Carro' }
    var modeMeta = (typeof CONFIG !== 'undefined' && CONFIG.TRANSPORT_MODES && CONFIG.TRANSPORT_MODES[data.mode])
      ? CONFIG.TRANSPORT_MODES[data.mode]
      : { icon: '❓', label: data.mode };

    // Route card: shows origin -> destination
    // Distance card: shows distance in km
    // Emission card: shows emission in kg CO2 (with leaf icon)
    // Transport card: shows icon + label
    // Savings card: shown only if mode !== 'car' and savings provided

    var html = '';

    // Route card
    html += '<div class="results__card results__card--route">';
    html +=   '<div class="results__card__title">Rota</div>';
    html +=   '<div class="results__card__body">' + (data.origin || '') + ' → ' + (data.destination || '') + '</div>';
    html += '</div>';

    // Distance card
    html += '<div class="results__card results__card--distance">';
    html +=   '<div class="results__card__title">Distância</div>';
    html +=   '<div class="results__card__body">' + this.formatNumber(data.distance || 0, 2) + ' km</div>';
    html += '</div>';

    // Emission card
    html += '<div class="results__card results__card--emission">';
    html +=   '<div class="results__card__title">Emissões</div>';
    html +=   '<div class="results__card__body">🌿 ' + this.formatNumber(data.emission || 0, 2) + ' kg CO₂e</div>';
    html += '</div>';

    // Transport card
    html += '<div class="results__card results__card--transport">';
    html +=   '<div class="results__card__title">Transporte</div>';
    html +=   '<div class="results__card__body">' + (modeMeta.icon || '') + ' ' + (modeMeta.label || data.mode) + '</div>';
    html += '</div>';

    // Savings card (optional)
    if (data.mode !== 'car' && data.savings && (data.savings.savedKg || data.savings.percentage)) {
      html += '<div class="results__card results__card--savings">';
      html +=   '<div class="results__card__title">Economia vs Carro</div>';
      html +=   '<div class="results__card__body">';
      html +=     'Você salva ' + this.formatNumber(data.savings.savedKg || 0, 2) + ' kg (' + (data.savings.percentage !== null ? this.formatNumber(data.savings.percentage, 2) + '%' : '-') + ')';
      html +=   '</div>';
      html += '</div>';
    }

    return html;
  },

  // Render comparison list for all modes
  // modesArray: [{mode, emission, percentageVsCar}], selectedMode: string
  renderComparion: function(modesArray, selectedMode) {
    // Determine max emission for 100% progress reference
    var maxEmission = 0;
    modesArray.forEach(function(m) { if (m.emission > maxEmission) maxEmission = m.emission; });
    if (maxEmission === 0) maxEmission = 1; // avoid division by zero

    var html = '';

    modesArray.forEach(function(item) {
      var isSelected = item.mode === selectedMode;

      // mode metadata
      var meta = (typeof CONFIG !== 'undefined' && CONFIG.TRANSPORT_MODES && CONFIG.TRANSPORT_MODES[item.mode])
        ? CONFIG.TRANSPORT_MODES[item.mode]
        : { icon: '❓', label: item.mode };

      // Emission percentage relative to maxEmission
      var pct = (item.emission / maxEmission) * 100;
      var pctDisplay = UI.formatNumber(item.emission, 2) + ' kg';

      // Color code bar based on pct thresholds
      var barColor = '--primary';
      if (pct > 100) barColor = 'red';
      else if (pct > 75) barColor = 'orange';
      else if (pct > 25) barColor = '--warning';

      html += '<div class="comparison__item' + (isSelected ? ' comparison__item--selected' : '') + '">';

      // Header with icon, label, emission and optional badge
      html +=   '<div class="comparison__item__header">';
      html +=     '<span class="comparison__item__icon">' + (meta.icon || '') + '</span>';
      html +=     '<span class="comparison__item__label">' + (meta.label || item.mode) + '</span>';
      html +=     '<span class="comparison__item__stats">' + pctDisplay + ' &nbsp; ' + (item.percentageVsCar !== null ? '(' + UI.formatNumber(item.percentageVsCar,2) + '% vs carro)' : '') + '</span>';
      if (isSelected) html += '<span class="comparison__item__badge">Selecionado</span>';
      html +=   '</div>';

      // Progress bar container
      html +=   '<div class="comparison__item__bar">';
      html +=     '<div class="comparison__item__bar-fill" style="width:' + Math.min(pct, 200) + '%; background:' + barColor + ';"></div>';
      html +=   '</div>';

      html += '</div>';
    });

    // Tip box at the end
    html += '<div class="comparison__tip">Dica: escolha meios mais eficientes para reduzir suas emissões.</div>';

    return html;
  },

  // Render carbon credits estimate
  // creditsData: { credits, price: { min, max, average } }
  renderCarbonCredits: function(creditsData) {
    var credits = creditsData.credits || 0;
    var price = creditsData.price || { min: 0, max: 0, average: 0 };

    // Grid with 2 cards: credits and estimated price
    var html = '';

    // Card 1: Credits needed
    html += '<div class="credits__grid">';
    html +=   '<div class="credits__card credits__card--count">';
    html +=     '<div class="credits__card__title">Créditos necessários</div>';
    html +=     '<div class="credits__card__value">' + this.formatNumber(credits, 4) + '</div>';
    html +=     '<div class="credits__card__helper">1 crédito = 1000 kg CO₂</div>';
    html +=   '</div>';

    // Card 2: Estimated price
    html +=   '<div class="credits__card credits__card--price">';
    html +=     '<div class="credits__card__title">Estimativa de preço</div>';
    html +=     '<div class="credits__card__value">' + this.formatCurrency(price.average || 0) + '</div>';
    html +=     '<div class="credits__card__range">Faixa: ' + this.formatCurrency(price.min || 0) + ' — ' + this.formatCurrency(price.max || 0) + '</div>';
    html +=   '</div>';
    html += '</div>';

    // Info box explaining carbon credits
    html += '<div class="credits__info">Créditos de carbono ajudam a compensar emissões investindo em projetos de captura ou redução de GEE.</div>';

    // Compensate button (demo)
    html += '<div class="credits__actions"><button class="btn btn--secondary">🛒 Compensar Emissões</button></div>';

    return html;
  },

  // Show loading state on a button element
  showLoading: function(buttonElement) {
    if (!buttonElement) return;
    // Save original text
    buttonElement.dataset.originalText = buttonElement.innerHTML;
    buttonElement.disabled = true;
    // Spinner + text
    buttonElement.innerHTML = '<span class="spinner"></span> Calculando...';
  },

  // Restore button from loading state
  hideLoading: function(buttonElement) {
    if (!buttonElement) return;
    buttonElement.disabled = false;
    if (buttonElement.dataset && buttonElement.dataset.originalText) {
      buttonElement.innerHTML = buttonElement.dataset.originalText;
      delete buttonElement.dataset.originalText;
    }
  }

};
// Manipulação DOM (funções globais)