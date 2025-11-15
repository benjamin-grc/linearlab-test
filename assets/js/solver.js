const EPS = 1e-10;

// Convertit un nombre en fraction "p/q"
function fractionString(x) {
  try {
    const f = math.fraction(x);
    return f.d === 1 ? `${f.n}` : `${f.n}/${f.d}`;
  } catch {
    return `${x}`;
  }
}

// Récupère m et n à partir des inputs
function getDimensions() {
  const mInput = document.getElementById('m');
  const nInput = document.getElementById('n');

  if (!mInput || !nInput) {
    return { m: NaN, n: NaN };
  }

  const m = parseInt(mInput.value);
  const n = parseInt(nInput.value);
  return { m, n };
}

// Génère la grille des coefficients (m x n) + b
function generateSystem() {
  const { m, n } = getDimensions();
  const container = document.getElementById('systemContainer');
  const resultDiv = document.getElementById('result');

  if (!container) return;
  if (resultDiv) resultDiv.textContent = "";

  if (isNaN(m) || isNaN(n) || m <= 0 || n <= 0) {
    container.innerHTML = "Merci d'entrer m ≥ 1 et n ≥ 1.";
    return;
  }

  let html = '<table><tr>';
  for (let j = 0; j < n; j++) {
    html += `<th>a<sub>•${j + 1}</sub></th>`;
  }
  html += `<th>b</th></tr>`;

  for (let i = 0; i < m; i++) {
    html += '<tr>';
    for (let j = 0; j < n; j++) {
      html += `<td><input type="number" step="any" id="a_${i}_${j}" value="0"></td>`;
    }
    html += `<td><input type="number" step="any" id="b_${i}" value="0"></td>`;
    html += '</tr>';
  }
  html += '</table>';

  container.innerHTML = html;
}

// Exemple aléatoire
function generateExample() {
  const { m, n } = getDimensions();
  const resultDiv = document.getElementById('result');

  if (isNaN(m) || isNaN(n) || m <= 0 || n <= 0) {
    if (resultDiv) resultDiv.textContent = "Choisissez d'abord m ≥ 1 et n ≥ 1.";
    return;
  }

  if (!document.getElementById("a_0_0")) {
    generateSystem();
  }

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      let v = Math.floor(Math.random() * 11) - 5; // -5..5
      if (v === 0) v = 1;
      document.getElementById(`a_${i}_${j}`).value = v;
    }
    document.getElementById(`b_${i}`).value = Math.floor(Math.random() * 21) - 10;
  }

  if (resultDiv) resultDiv.textContent = "";
}

// Formate une expression symbolique (constante + somme coeff * xk)
function formatExpr(expr) {
  let parts = [];
  let first = true;

  // constante
  if (Math.abs(expr.constant) > EPS) {
    const val = expr.constant;
    const absVal = Math.abs(val);
    const coeffStr = fractionString(absVal);
    const signStr = val < 0 ? "-" : "";
    parts.push(signStr + coeffStr);
    first = false;
  }

  // termes en xk
  const vars = Object.keys(expr.deps).sort();
  for (const v of vars) {
    let c = expr.deps[v];
    if (Math.abs(c) < EPS) continue;

    const isNeg = c < 0;
    const absC = Math.abs(c);

    let signStr;
    if (first) {
      signStr = isNeg ? "-" : "";
    } else {
      signStr = isNeg ? " - " : " + ";
    }

    let coeffStr = "";
    if (Math.abs(absC - 1) < EPS) {
      // 1 ou -1 -> signe seulement
      coeffStr = "";
    } else {
      coeffStr = fractionString(absC) + "*";
    }

    parts.push(signStr + coeffStr + v);
    first = false;
  }

  if (parts.length === 0) return "0";
  return parts.join("");
}

// Résout le système m×n
function solveSystem() {
  const { m, n } = getDimensions();
  const result = document.getElementById("result");
  const container = document.getElementById("systemContainer");

  if (!result || !container) return;
  result.textContent = "";

  if (isNaN(m) || isNaN(n) || m <= 0 || n <= 0) {
    result.textContent = "Veuillez d'abord créer un système valide (m, n).";
    return;
  }

  // matrice augmentée A|b
  let A = [];
  try {
    for (let i = 0; i < m; i++) {
      let row = [];
      for (let j = 0; j < n; j++) {
        const v = parseFloat(document.getElementById(`a_${i}_${j}`).value);
        if (isNaN(v)) throw new Error("Coefficient invalide");
        row.push(v);
      }
      const bi = parseFloat(document.getElementById(`b_${i}`).value);
      if (isNaN(bi)) throw new Error("Second membre invalide");
      row.push(bi);
      A.push(row);
    }
  } catch (e) {
    result.textContent = "❌ Erreur : coefficient ou second membre invalide.";
    return;
  }

  // Élimination de Gauss
  let row = 0;
  for (let col = 0; col < n && row < m; col++) {
    let pivotRow = row;
    for (let i = row + 1; i < m; i++) {
      if (Math.abs(A[i][col]) > Math.abs(A[pivotRow][col])) {
        pivotRow = i;
      }
    }

    if (Math.abs(A[pivotRow][col]) < EPS) continue;

    [A[row], A[pivotRow]] = [A[pivotRow], A[row]];

    let pivot = A[row][col];
    for (let i = row + 1; i < m; i++) {
      let f = A[i][col] / pivot;
      for (let j = col; j <= n; j++) {
        A[i][j] -= f * A[row][j];
      }
    }
    row++;
  }

  // rang(A), rang(A|b)
  let rankA = 0, rankAug = 0;
  for (let i = 0; i < m; i++) {
    let nzA = false, nzAug = false;
    for (let j = 0; j < n; j++) {
      if (Math.abs(A[i][j]) > EPS) {
        nzA = true;
        nzAug = true;
      }
    }
    if (Math.abs(A[i][n]) > EPS) nzAug = true;

    if (nzA) rankA++;
    if (nzAug) rankAug++;
  }

  let out = "";
  out += `rang(A) = ${rankA}\n`;
  out += `rang(A|b) = ${rankAug}\n\n`;

  // cas : aucune solution
  if (rankAug > rankA) {
    result.textContent = out + "❌ Le système est incompatible : aucune solution.";
    return;
  }

  // cas : solution unique (rangA = n)
  if (rankA === n) {
    out += "✅ Le système admet une solution unique.\n\n";

    let x = Array(n).fill(0);

    for (let i = m - 1; i >= 0; i--) {
      let pivotCol = -1;
      for (let j = 0; j < n; j++) {
        if (Math.abs(A[i][j]) > EPS) {
          pivotCol = j;
          break;
        }
      }
      if (pivotCol === -1) continue;

      let sum = A[i][n];
      for (let j = pivotCol + 1; j < n; j++) {
        sum -= A[i][j] * x[j];
      }
      x[pivotCol] = sum / A[i][pivotCol];
    }

    for (let j = 0; j < n; j++) {
      out += `x${j + 1} = ${fractionString(x[j])}  (≈ ${x[j]})\n`;
    }

    result.textContent = out;
    return;
  }

  // cas : infinité de solutions
  out += "♾ Le système admet une infinité de solutions.\n\n";

  const pivotColForRow = Array(m).fill(-1);
  const isPivotCol = Array(n).fill(false);

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (Math.abs(A[i][j]) > EPS) {
        pivotColForRow[i] = j;
        isPivotCol[j] = true;
        break;
      }
    }
  }

  const freeCols = [];
  for (let j = 0; j < n; j++) {
    if (!isPivotCol[j]) freeCols.push(j);
  }

  if (freeCols.length > 0) {
    out += "Variables libres :\n";
    freeCols.forEach(c => out += `  x${c + 1} libre\n`);
    out += "\n";
  }

  // expr[j] = { constant, deps: { "xk": coeff } }
  const expr = [];
  for (let j = 0; j < n; j++) {
    expr[j] = { constant: 0, deps: {} };
  }

  // variables libres : xj = xj
  for (const col of freeCols) {
    expr[col].deps[`x${col + 1}`] = 1;
  }

  // back-substitution symbolique
  for (let i = m - 1; i >= 0; i--) {
    let pc = pivotColForRow[i];
    if (pc === -1) continue;
    let pivot = A[i][pc];
    if (Math.abs(pivot) < EPS) continue;

    let constant = A[i][n];
    let deps = {};

    for (let j = pc + 1; j < n; j++) {
      if (Math.abs(A[i][j]) > EPS) {
        let coef = A[i][j];
        constant -= coef * expr[j].constant;
        for (let v in expr[j].deps) {
          deps[v] = (deps[v] || 0) - coef * expr[j].deps[v];
        }
      }
    }

    constant /= pivot;
    for (let v in deps) {
      deps[v] /= pivot;
    }

    expr[pc].constant = constant;
    expr[pc].deps = deps;
  }

  // affichage des xj
  for (let j = 0; j < n; j++) {
    const formatted = formatExpr(expr[j]);
    out += `x${j + 1} = ${formatted}\n`;
  }

  result.textContent = out;
}

// Générer un système au chargement (si m et n existent déjà)
window.addEventListener('load', () => {
  const mInput = document.getElementById('m');
  const nInput = document.getElementById('n');
  if (mInput && nInput) {
    generateSystem();
  }
});
