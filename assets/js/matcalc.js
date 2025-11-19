// assets/js/matcalc.js

function getSelectedOperation() {
  const selected = document.querySelector('input[name="operation"]:checked');
  return selected ? selected.value : null;
}

function updateMatrices() {
    const rowsA = parseInt(document.getElementById("rows-A")?.value, 10) || 1;
    const colsA = parseInt(document.getElementById("cols-A")?.value, 10) || 1;
    const rowsB = parseInt(document.getElementById("rows-B")?.value, 10) || 1;
    const colsB = parseInt(document.getElementById("cols-B")?.value, 10) || 1;

    // Crée A
    createMatrix("matrix-A", rowsA, colsA);

    // Gère l'affichage de B selon l’opération
    const op = getSelectedOperation();
    const matrixBContainer = document.getElementById("matrix-B-container");
    const sizeBCard = document.getElementById("size-B-card");
    const needB = !(op === "detA" || op === "luA"); // ex: pas besoin de B pour det(A), LU(A)

    if (matrixBContainer) {
      matrixBContainer.style.display = needB ? "" : "none";
    }

    if (sizeBCard) {
      sizeBCard.style.display = needB ? "" : "none";
    }

    if (needB) {
      createMatrix("matrix-B", rowsB, colsB);
    }
  }
  
  function handleCompute() {
    renderError("");              // efface l'erreur
    renderScalar("result-scalar", "");
    renderMatrix("result-matrix", []); // efface éventuellement l'ancienne matrice (optionnel)
  
    const op = getSelectedOperation();
    if (!op) return;
  
    try {
      const A = readMatrix("matrix-A");
      let B, R;
  
      switch (op) {
        case "add":
          B = readMatrix("matrix-B");
          R = math.add(A, B);                  // math.js
          renderMatrix("result-matrix", R);
          break;
  
        case "sub":
          B = readMatrix("matrix-B");
          R = math.subtract(A, B);             // math.js
          renderMatrix("result-matrix", R);
          break;
  
        case "mul":
          B = readMatrix("matrix-B");
          R = math.multiply(A, B);             // math.js
          renderMatrix("result-matrix", R);
          break;
  
        case "detA": {
          const d = math.det(A);               // math.js
          renderScalar("result-scalar", "det(A) = " + d);
          break;
        }
  
        case "detB":{
            B = readMatrix("matrix-B");
            const d = math.det(B);
            renderScalar("result-scalar","det(B) = " +d);
        }

        case "luA": {
            const A = readMatrix("matrix-A");
        
            const {L, U, P} = math.lup(A);
        
            // Afficher L
            renderMatrix("result-matrix-L", L);
        
            // Afficher U
            renderMatrix("result-matrix-U", U);
        
            // Si tu veux P aussi
            // renderMatrix("result-matrix-P", P);
        
            break;
        }

        case "luB": {
            const B = readMatrix("matrix-B");
        
            const {L, U, P} = math.lup(B);
        
            // Afficher L
            renderMatrix("result-matrix-L", L);
        
            // Afficher U
            renderMatrix("result-matrix-U", U);
        
            // Si tu veux P aussi
            // renderMatrix("result-matrix-P", P);
        
            break;
        }

        default:
          throw new Error("Opération non gérée : " + op);
      }


    } catch (err) {
      console.error(err);
      renderError(err.message || "Erreur de calcul");
    }
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    // bouton "Mettre à jour les matrices"
    const updateBtn = document.getElementById("update-matrices-btn");
    if (updateBtn) {
      updateBtn.addEventListener("click", updateMatrices);
    }
  
    // bouton "Calculer"
    const computeBtn = document.getElementById("compute-btn");
    if (computeBtn) {
      computeBtn.addEventListener("click", handleCompute);
    }
  
    // Mise à jour automatique quand on change tailles / opération
    const sizeInputs = document.querySelectorAll(
      "#rows-A, #cols-A, #rows-B, #cols-B"
    );

    sizeInputs.forEach((input) => {
      input.addEventListener("change", updateMatrices);
      input.addEventListener("input", updateMatrices);
    });

    document.querySelectorAll('input[name="operation"]').forEach((input) => {
      input.addEventListener("change", () => {
        updateMatrices();
        toggleLUVisibility();
      });
    });

    initDimensionDisplays();

    // Génère une première fois les matrices
    updateMatrices();
    toggleLUVisibility();
  });


  function toggleLUVisibility() {
    const op = getSelectedOperation();
    const luBlock = document.getElementById("result-lu");

    if (op === "luA" || op === "luB") {
      luBlock.style.display = "block"; // montrer le LU
    } else {
      luBlock.style.display = "none";  // cacher le LU
    }
  }

  function initDimensionDisplays() {
    document.querySelectorAll("[data-range-display]").forEach((display) => {
      const inputId = display.getAttribute("data-range-display");
      const input = document.getElementById(inputId);

      if (!input) return;

      const updateDisplay = () => {
        display.textContent = input.value;
      };

      input.addEventListener("input", updateDisplay);
      input.addEventListener("change", updateDisplay);
      updateDisplay();
    });
  }
  
