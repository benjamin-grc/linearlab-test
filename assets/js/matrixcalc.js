const MAX_SIZE = 6;
const EPSILON = 1e-9;

const operationDescriptions = {
  determinant: "Calcul du déterminant par élimination de Gauss.",
  addition: "Addition membre à membre des matrices A et B.",
  multiplication: "Produit matriciel classique A × B.",
  transpose: "Transposée de la matrice A.",
  lu: "Décomposition de A en un produit LU (Doolittle)."
};

const examples = {
  determinant: {
    A: [
      [2, 1, 0],
      [1, 3, -1],
      [0, 2, 4]
    ]
  },
  addition: {
    A: [
      [1, -2],
      [3, 4]
    ],
    B: [
      [5, 0],
      [-1, 2]
    ]
  },
  multiplication: {
    A: [
      [2, 0, 1],
      [-1, 3, 2]
    ],
    B: [
      [1, 2],
      [0, -1],
      [4, 3]
    ]
  },
  transpose: {
    A: [
      [2, -3, 5],
      [4, 0, 1]
    ]
  },
  lu: {
    A: [
      [4, 3],
      [6, 3]
    ]
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const operationSelect = document.getElementById("operation");
  const rowsAInput = document.getElementById("rowsA");
  const colsAInput = document.getElementById("colsA");
  const rowsBInput = document.getElementById("rowsB");
  const colsBInput = document.getElementById("colsB");

  const matrixAContainer = document.getElementById("matrixA");
  const matrixBContainer = document.getElementById("matrixB");
  const matrixBSettings = document.getElementById("matrixBSettings");
  const matrixBBlock = document.getElementById("matrixBBlock");
  const matrixAInfo = document.getElementById("matrixAInfo");
  const matrixBInfo = document.getElementById("matrixBInfo");
  const operationHelp = document.getElementById("operationHelp");
  const resultContainer = document.getElementById("result");

  const computeButton = document.getElementById("compute");
  const exampleButton = document.getElementById("example");
  const randomButtons = document.querySelectorAll("button[data-fill]");

  const state = {
    rowsA: Number(rowsAInput.value),
    colsA: Number(colsAInput.value),
    rowsB: Number(rowsBInput.value),
    colsB: Number(colsBInput.value)
  };

  const updateState = () => {
    state.rowsA = clampInput(rowsAInput);
    state.colsA = clampInput(colsAInput);
    state.rowsB = clampInput(rowsBInput);
    state.colsB = clampInput(colsBInput);
  };

  const renderMatrices = () => {
    renderMatrix(matrixAContainer, state.rowsA, state.colsA, "A");
    renderMatrix(matrixBContainer, state.rowsB, state.colsB, "B");
  };

  const updateOperationUI = () => {
    const op = operationSelect.value;
    const needsMatrixB = op === "addition" || op === "multiplication";

    matrixBSettings.style.display = needsMatrixB ? "flex" : "none";
    matrixBBlock.style.display = needsMatrixB ? "flex" : "none";

    const lockMatrixB = op === "addition";
    rowsBInput.disabled = lockMatrixB;
    colsBInput.disabled = lockMatrixB;

    if (lockMatrixB) {
      rowsBInput.value = rowsAInput.value;
      colsBInput.value = colsAInput.value;
      state.rowsB = Number(rowsBInput.value);
      state.colsB = Number(colsBInput.value);
    }

    matrixAInfo.textContent = op === "determinant" || op === "lu" ? "Doit être carrée" : "";
    matrixBInfo.textContent = op === "multiplication" ? "Colonnes A = Lignes B" : lockMatrixB ? "Synchronisée avec A" : "";
    operationHelp.textContent = operationDescriptions[op];
    renderMatrices();
  };

  const loadExample = () => {
    const op = operationSelect.value;
    const example = examples[op];
    if (!example) return;

    applyExample(matrixAContainer, example.A, rowsAInput, colsAInput, state, "A");

    if (example.B) {
      applyExample(matrixBContainer, example.B, rowsBInput, colsBInput, state, "B");
    } else if (op === "addition") {
      rowsBInput.value = rowsAInput.value;
      colsBInput.value = colsAInput.value;
      state.rowsB = state.rowsA;
      state.colsB = state.colsA;
      renderMatrix(matrixBContainer, state.rowsB, state.colsB, "B");
    }
  };

  operationSelect.addEventListener("change", () => {
    updateState();
    updateOperationUI();
    resultContainer.innerHTML = "";
  });

  [rowsAInput, colsAInput, rowsBInput, colsBInput].forEach((input) => {
    input.addEventListener("change", () => {
      updateState();
      if (operationSelect.value === "addition") {
        rowsBInput.value = rowsAInput.value;
        colsBInput.value = colsAInput.value;
        state.rowsB = state.rowsA;
        state.colsB = state.colsA;
      }
      renderMatrices();
    });
  });

  computeButton.addEventListener("click", () => {
    try {
      const op = operationSelect.value;
      const matrixA = readMatrix(matrixAContainer, state.rowsA, state.colsA, "A");
      let output = null;

      switch (op) {
        case "determinant":
          ensureSquare(state.rowsA, state.colsA, "Le déterminant nécessite une matrice carrée.");
          output = { type: "text", title: "Déterminant", value: formatNumber(determinant(matrixA)) };
          break;
        case "addition": {
          const matrixB = readMatrix(matrixBContainer, state.rowsB, state.colsB, "B");
          validateSameDimensions(state, "Pour additionner, les matrices doivent avoir les mêmes dimensions.");
          output = { type: "matrix", matrices: [{ title: "A + B", data: addMatrices(matrixA, matrixB) }] };
          break;
        }
        case "multiplication": {
          const matrixB = readMatrix(matrixBContainer, state.rowsB, state.colsB, "B");
          validateMultiplication(state);
          output = { type: "matrix", matrices: [{ title: "A × B", data: multiplyMatrices(matrixA, matrixB) }] };
          break;
        }
        case "transpose":
          output = { type: "matrix", matrices: [{ title: "Aᵗ", data: transposeMatrix(matrixA) }] };
          break;
        case "lu":
          ensureSquare(state.rowsA, state.colsA, "La décomposition LU nécessite une matrice carrée.");
          output = formatLU(luDecomposition(matrixA));
          break;
        default:
          throw new Error("Opération non supportée");
      }

      displayResult(resultContainer, output);
    } catch (error) {
      displayError(resultContainer, error.message);
    }
  });

  exampleButton.addEventListener("click", () => {
    loadExample();
  });

  randomButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.fill;
      const rows = target === "matrixA" ? state.rowsA : state.rowsB;
      const cols = target === "matrixA" ? state.colsA : state.colsB;
      const container = target === "matrixA" ? matrixAContainer : matrixBContainer;
      fillRandomMatrix(container, rows, cols);
    });
  });

  renderMatrices();
  updateOperationUI();
});

function clampInput(input) {
  const min = Number(input.min) || 1;
  const max = Number(input.max) || MAX_SIZE;
  let value = Number(input.value);
  if (Number.isNaN(value)) value = min;
  value = Math.min(Math.max(value, min), max);
  input.value = value;
  return value;
}

function renderMatrix(container, rows, cols, prefix) {
  const previousValues = {};
  container.querySelectorAll("input").forEach((input) => {
    previousValues[input.dataset.key] = input.value;
  });

  container.innerHTML = "";
  container.style.gridTemplateColumns = `repeat(${cols}, minmax(70px, 1fr))`;

  for (let i = 0; i < rows; i += 1) {
    for (let j = 0; j < cols; j += 1) {
      const input = document.createElement("input");
      input.type = "number";
      input.step = "0.01";
      input.placeholder = "0";
      const key = `${prefix}-${i}-${j}`;
      input.dataset.key = key;
      input.value = previousValues[key] ?? "";
      input.setAttribute("aria-label", `Élément ${prefix}${i + 1}${j + 1}`);
      container.appendChild(input);
    }
  }
}

function readMatrix(container, rows, cols, prefix) {
  const inputs = Array.from(container.querySelectorAll("input"));
  if (inputs.length !== rows * cols) {
    throw new Error(`La matrice ${prefix} n'est pas correctement définie.`);
  }
  const matrix = [];
  for (let i = 0; i < rows; i += 1) {
    const row = [];
    for (let j = 0; j < cols; j += 1) {
      const index = i * cols + j;
      const value = parseFloat(inputs[index].value);
      row.push(Number.isNaN(value) ? 0 : value);
    }
    matrix.push(row);
  }
  return matrix;
}

function addMatrices(A, B) {
  return A.map((row, i) => row.map((value, j) => value + B[i][j]));
}

function multiplyMatrices(A, B) {
  const rows = A.length;
  const cols = B[0].length;
  const shared = B.length;
  const result = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i += 1) {
    for (let k = 0; k < shared; k += 1) {
      for (let j = 0; j < cols; j += 1) {
        result[i][j] += A[i][k] * B[k][j];
      }
    }
  }
  return result;
}

function transposeMatrix(matrix) {
  return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
}

function determinant(matrix) {
  const n = matrix.length;
  const temp = matrix.map((row) => [...row]);
  let det = 1;
  for (let i = 0; i < n; i += 1) {
    let pivot = i;
    while (pivot < n && Math.abs(temp[pivot][i]) < EPSILON) {
      pivot += 1;
    }
    if (pivot === n) {
      return 0;
    }
    if (pivot !== i) {
      [temp[i], temp[pivot]] = [temp[pivot], temp[i]];
      det *= -1;
    }
    const pivotValue = temp[i][i];
    det *= pivotValue;
    for (let j = i + 1; j < n; j += 1) {
      const factor = temp[j][i] / pivotValue;
      for (let k = i; k < n; k += 1) {
        temp[j][k] -= factor * temp[i][k];
      }
    }
  }
  return det;
}

function luDecomposition(matrix) {
  const n = matrix.length;
  const L = Array.from({ length: n }, () => Array(n).fill(0));
  const U = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i += 1) {
    for (let k = i; k < n; k += 1) {
      let sum = 0;
      for (let j = 0; j < i; j += 1) {
        sum += L[i][j] * U[j][k];
      }
      U[i][k] = matrix[i][k] - sum;
    }

    if (Math.abs(U[i][i]) < EPSILON) {
      throw new Error("La matrice est singulière : impossible de calculer LU sans pivotage.");
    }

    for (let k = i; k < n; k += 1) {
      if (i === k) {
        L[i][i] = 1;
      } else {
        let sum = 0;
        for (let j = 0; j < i; j += 1) {
          sum += L[k][j] * U[j][i];
        }
        L[k][i] = (matrix[k][i] - sum) / U[i][i];
      }
    }
  }

  return { L, U };
}

function formatLU({ L, U }) {
  return {
    type: "matrix",
    matrices: [
      { title: "Matrice L", data: L },
      { title: "Matrice U", data: U }
    ]
  };
}

function validateSameDimensions(state, message) {
  if (state.rowsA !== state.rowsB || state.colsA !== state.colsB) {
    throw new Error(message);
  }
}

function validateMultiplication(state) {
  if (state.colsA !== state.rowsB) {
    throw new Error("Impossible de multiplier : colonnes de A ≠ lignes de B.");
  }
}

function ensureSquare(rows, cols, message) {
  if (rows !== cols) {
    throw new Error(message);
  }
}

function displayResult(container, output) {
  container.innerHTML = "";
  if (!output) return;

  if (output.type === "text") {
    const title = document.createElement("h3");
    title.textContent = output.title;
    const value = document.createElement("p");
    value.className = "success";
    value.textContent = output.value;
    container.append(title, value);
  }

  if (output.type === "matrix") {
    output.matrices.forEach(({ title, data }) => {
      const wrapper = document.createElement("div");
      wrapper.className = "result-table";
      const heading = document.createElement("h3");
      heading.textContent = title;
      wrapper.appendChild(heading);
      wrapper.appendChild(buildTable(data));
      container.appendChild(wrapper);
    });
  }
}

function displayError(container, message) {
  container.innerHTML = "";
  const error = document.createElement("p");
  error.className = "error";
  error.textContent = message;
  container.appendChild(error);
}

function buildTable(matrix) {
  const table = document.createElement("table");
  matrix.forEach((row) => {
    const tr = document.createElement("tr");
    row.forEach((value) => {
      const td = document.createElement("td");
      td.textContent = formatNumber(value);
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
  return table;
}

function formatNumber(value) {
  if (typeof value !== "number") return value;
  const rounded = Math.abs(value) < EPSILON ? 0 : value;
  return Number.parseFloat(rounded.toFixed(4));
}

function fillRandomMatrix(container, rows, cols) {
  const inputs = container.querySelectorAll("input");
  if (inputs.length !== rows * cols) return;
  inputs.forEach((input) => {
    const randomValue = (Math.random() * 10 - 5).toFixed(0);
    input.value = randomValue;
  });
}

function applyExample(container, matrix, rowsInput, colsInput, state, prefix) {
  if (!matrix) return;
  rowsInput.value = matrix.length;
  colsInput.value = matrix[0].length;
  state[`rows${prefix}`] = matrix.length;
  state[`cols${prefix}`] = matrix[0].length;
  renderMatrix(container, matrix.length, matrix[0].length, prefix);
  const inputs = container.querySelectorAll("input");
  matrix.flat().forEach((value, index) => {
    inputs[index].value = value;
  });
}
