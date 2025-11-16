// Creer une grille de matrice (inputs)
function createMatrix(containerId, rows, cols) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
  
    for (let i = 0; i < rows; i++) {
      const row = document.createElement("div");
      row.className = "matrix-row";
  
      for (let j = 0; j < cols; j++) {
        const input = document.createElement("input");
        input.type = "number";
        input.className = "matrix-cell";
        input.value = "0";
        row.appendChild(input);
      }
  
      container.appendChild(row);
    }
  }
  
  // Lire une matrice depuis le DOM et renvoyer un tableau 2D
  function readMatrix(containerId) {
    const container = document.getElementById(containerId);
    const rows = [];
  
    const rowDivs = container.querySelectorAll(".matrix-row");
    rowDivs.forEach(rowDiv => {
      const row = [];
      rowDiv.querySelectorAll(".matrix-cell").forEach(cell => {
        const v = parseFloat(cell.value.replace(",", "."));
        row.push(isNaN(v) ? 0 : v);
      });
      rows.push(row);
    });
  
    return rows;
  }

// Afficher une matrice résultat (en lecture seule, style identique aux matrices)
function renderMatrix(containerId, matrix) {
    const container = document.getElementById(containerId);
    if (!container) return;
  
    container.innerHTML = "";
  
    const wrapper = document.createElement("div");
    wrapper.className = "matrix-grid matrix-grid-result";
  
    matrix.forEach(row => {
      const rowDiv = document.createElement("div");
      rowDiv.className = "matrix-row";
  
      row.forEach(value => {
        const input = document.createElement("input");
        input.type = "text";
        input.className = "matrix-cell matrix-cell-result";
        input.value = value;
        input.readOnly = true;
  
        rowDiv.appendChild(input);
      });
  
      wrapper.appendChild(rowDiv);
    });
  
    container.appendChild(wrapper);
  }
  
  
  // Afficher un scalaire
  function renderScalar(containerId, value) {
    const el = document.getElementById(containerId);
    el.textContent = value;
  }
  
  // Message d'erreur
  function renderError(message) {
    const el = document.getElementById("error-message");
    el.textContent = message;
  }
  