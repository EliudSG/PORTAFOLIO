document.addEventListener("DOMContentLoaded", () => {
  const filas = 8;
  const columnas = 25;
  const filasF = [];
  const etiquetasExtras = ["1º", "2º", "3º", "B", "T"];
  const container = document.getElementById('puntuacion-container');
  document.getElementById("puntuacion-container").style.fontFamily = "Arial";
  let celdaSeleccionada = null;

  const columnasBloqueadas = new Array(columnas).fill(false);
  const valores = Array.from({ length: filas }, () => new Array(columnas).fill(null));
  const totales = [new Array(columnas).fill(0), new Array(columnas).fill(0)];

  let filaValoresPreguntaInputs = [];
  let mostrarColumnaT = false;

function crearBotonTotal() {
  const contenedorBotones = document.createElement("div");
  contenedorBotones.id = "contenedor-botones-superiores";

  const botonCaptura = document.createElement("button");
  botonCaptura.classList.add("total-btn", "boton-captura");
  botonCaptura.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#444" viewBox="0 0 24 24">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M17 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm0 4H5V5h12v2zm-5 13H8v-5h4v5z"/>
    </svg>
  `;
  botonCaptura.title = "Capturar pantalla";

botonCaptura.addEventListener("click", () => {
  const container = document.getElementById("puntuacion-container");

  const inputs = container.querySelectorAll("input.nombre-input");
  const estilosOriginales = [];

  inputs.forEach(input => {
    estilosOriginales.push({
      width: input.style.width,
      fontSize: input.style.fontSize,
      overflow: input.style.overflow,
      textAlign: input.style.textAlign,
    });

    input.style.width = "120px";
    input.style.fontSize = "13px";
    input.style.overflow = "visible";
    input.style.textAlign = "left"; 
  });

  setTimeout(() => {
    html2canvas(container).then(canvas => {
      const inputVerde = container.querySelector("input.nombre-equipo-verde");
      const inputRojo = container.querySelector("input.nombre-equipo-rojo");

      const nombreEquipoVerde = inputVerde ? inputVerde.value.trim() : "EquipoVerde";
      const nombreEquipoRojo = inputRojo ? inputRojo.value.trim() : "EquipoRojo";

      const nombreArchivo = `${sanitizeFileName(nombreEquipoVerde)} vs ${sanitizeFileName(nombreEquipoRojo)}.png`;

      const link = document.createElement("a");
      link.download = nombreArchivo;
      link.href = canvas.toDataURL();
      link.click();

      inputs.forEach((input, idx) => {
        input.style.width = estilosOriginales[idx].width;
        input.style.fontSize = estilosOriginales[idx].fontSize;
        input.style.overflow = estilosOriginales[idx].overflow;
        input.style.textAlign = estilosOriginales[idx].textAlign;
      });
    });
  }, 100);
});
function sanitizeFileName(name) {
  return name.replace(/[\/\\:*?"<>|]/g, '').replace(/\s+/g, '_');
}

  const botonTotal = document.createElement("button");
  botonTotal.textContent = "TOTAL";
  botonTotal.classList.add("total-btn", "boton-total");
  botonTotal.addEventListener("click", () => {
    sincronizarValoresDesdeCeldas();
    mostrarColumnaT = true;
    recalcularTotalesAcumulados();
    actualizarTotalesUI();
    actualizarTotalesFila();
  });

  contenedorBotones.appendChild(botonCaptura);
  contenedorBotones.appendChild(botonTotal);
  document.body.appendChild(contenedorBotones);
}

function crearFilaTotales(nombreFila) {
  const filaTotales = document.createElement('div');
  filaTotales.classList.add('fila');
  const label = document.createElement('span');
  label.textContent = nombreFila;
  label.classList.add('totales-label');
  label.style.width = '60px';
  label.style.lineHeight = '20px';
  label.style.fontWeight = 'bold';
  filaTotales.appendChild(label);
  for (let j = 0; j < columnas; j++) {
    const celda = document.createElement('input');
    celda.classList.add('celda');
    celda.readOnly = true;
    celda.style.cursor = 'default';
    bloquearSiEsColumnaEspecial(celda, j); 
    if (j % 2 === 0) celda.classList.add('par');

    if (j === 23 || j === 24) {
      celda.style.backgroundColor = '#e6e6e6';
      celda.tabIndex = -1;
      celda.addEventListener('focus', (e) => e.target.blur());
      celda.addEventListener('click', (e) => e.preventDefault());
    }

    filaTotales.appendChild(celda);
  }
  container.appendChild(filaTotales);
  return filaTotales.querySelectorAll('input.celda');
}

function crearFilaEtiquetaF(nombreEquipo = "") {
  const fila = document.createElement('div');
  fila.classList.add('fila');
  fila.style.justifyContent = 'flex-start';
  const inputEquipo = document.createElement('input');
  inputEquipo.type = 'text';
  inputEquipo.placeholder = nombreEquipo || "EQUIPO";
  inputEquipo.classList.add('nombre-input');
  if (nombreEquipo.toUpperCase().includes("VERDE")) {
    inputEquipo.classList.add("nombre-equipo-verde");
  } else if (nombreEquipo.toUpperCase().includes("ROJO")) {
    inputEquipo.classList.add("nombre-equipo-rojo");
  }
  inputEquipo.style.width = '100px';
  inputEquipo.style.marginRight = '1px';
  inputEquipo.style.marginLeft = '29px';
  inputEquipo.style.backgroundColor = "#f0f0f0";
  inputEquipo.style.textAlign = 'center';

  fila.appendChild(inputEquipo);

  const celdasF = [];

  for (let j = 0; j < columnas; j++) {
    const celda = document.createElement('input');
    celda.type = 'text';
    celda.classList.add('celda');
    if (j % 2 === 0) celda.classList.add('par');
    bloquearSiEsColumnaEspecial(celda, j);

    celda.readOnly = true;
    celda.style.cursor = 'pointer';
    celda.addEventListener('focus', (e) => e.target.blur());

    if (![23, 24].includes(j)) {
      celda.addEventListener('click', () => seleccionarCelda(celda));
      // Agregar evento de doble clic para borrar completamente
      celda.addEventListener('dblclick', (e) => {
        e.preventDefault();
        celda.value = '';
        celda.classList.remove('contorno-rojo');
        celda.style.backgroundColor = '';
        recalcularTotalesAcumulados();
        actualizarTotalesUI();
        actualizarTotalesFila();
      });
    }

    if (j === 0) {
      const spanF = document.createElement('span');
      spanF.textContent = 'F.';
      spanF.style.color = '#aa0000';
      spanF.style.fontStyle = 'Arial`';
      spanF.style.fontWeight = 'bold';
      spanF.style.fontSize = '13px';
      spanF.style.marginRight = '8px';

      const wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.alignItems = 'center';
      wrapper.appendChild(spanF);
      wrapper.appendChild(celda);

      fila.appendChild(wrapper);
    } else {
      fila.appendChild(celda);
    }
    celdasF.push(celda);
  }

  filasF.push(celdasF);
  container.appendChild(fila);
}

function crearFilaValoresPregunta() {
  const fila = document.createElement('div');
  fila.classList.add('fila');
  const espacio = document.createElement('div');
  espacio.classList.add('totales-label');
  espacio.style.width = '60px';
  espacio.style.height = '22px';
  espacio.style.display = 'inline-block';
  fila.appendChild(espacio);

for (let j = 0; j < columnas; j++) {
  const celda = document.createElement('input');
  celda.classList.add('celda');
  if (j % 2 === 0) celda.classList.add('par');
  celda.placeholder = '';
  celda.readOnly = true;
  celda.style.cursor = 'pointer';

  bloquearSiEsColumnaEspecial(celda, j);  // <-- Agregado aquí

  celda.addEventListener('click', () => seleccionarCelda(celda));
  fila.appendChild(celda);
  filaValoresPreguntaInputs.push(celda);
  filaValoresPreguntaInputs.forEach((celda, col) => {
    valores[0][col] = null;
  });
}


  container.appendChild(fila);
  
}


function crearFilaTotales(nombreFila) {
  const filaTotales = document.createElement('div');
  filaTotales.classList.add('fila');
  const label = document.createElement('span');
  label.textContent = nombreFila;
  label.classList.add('totales-label');
  label.style.width = '60px';
  label.style.lineHeight = '20px';
  label.style.fontWeight = 'bold';
  filaTotales.appendChild(label);
  for (let j = 0; j < columnas; j++) {
    const celda = document.createElement('input');
    celda.classList.add('celda');
    celda.readOnly = true;
    celda.style.cursor = 'default';
    if (j % 2 === 0) celda.classList.add('par');

    if (j === 23 || j === 24) {
      celda.style.backgroundColor = '#e6e6e6';
      celda.tabIndex = -1;
      celda.addEventListener('focus', (e) => e.target.blur());
      celda.addEventListener('click', (e) => e.preventDefault());
    }

    filaTotales.appendChild(celda);
  }
  container.appendChild(filaTotales);
  return filaTotales.querySelectorAll('input.celda');
}
function crearFilaNumeros() {
  const fila = document.createElement('div');
  fila.classList.add('fila');
  const vacio = document.createElement('span');
  vacio.classList.add('totales-label');
  vacio.style.width = '60px';
  fila.appendChild(vacio);
  for (let i = 1; i <= columnas; i++) {
    const celda = document.createElement('input');
    celda.classList.add('celda');
    celda.readOnly = true;
    celda.style.cursor = 'default';
    if (i <= 20) {
      celda.value = i;
      celda.classList.add('numero');
    } else {
      celda.value = etiquetasExtras[i - 21];
      celda.classList.add('extra');
    }

    if (i === 24 || i === 25) {
      celda.style.backgroundColor = '#e6e6e6';
      celda.tabIndex = -1; // Quitar del tabulador
      celda.addEventListener('focus', (e) => e.target.blur()); // Quitar foco si lo recibe
      celda.addEventListener('click', (e) => e.preventDefault()); // Bloquear click
    }

    if (i % 2 === 1) celda.classList.add('par');
    fila.appendChild(celda);
  }
  container.appendChild(fila);
}

function seleccionarCelda(celda) {
  if (!celda) return;

  document.querySelectorAll('.celda').forEach(c => c.classList.remove('selected'));

  celdaSeleccionada = celda;

  if (celda.classList.contains('nombre-input') || 
      celda.classList.contains('nombre-equipo-verde') || 
      celda.classList.contains('nombre-equipo-rojo')) {
    celda.focus();
    return; 
  }
  celda.classList.add('selected');
  celda.focus();
}

  crearBotonTotal();
  crearFilaNumeros();
  crearFilaValoresPregunta();
  
crearFilaEtiquetaF("EQUIPO VERDE");


const filasCeldas = [];
const inputNombres = [];
let totalesFila1 = null;
let totalesFila2 = null;
for (let i = 0; i < filas; i++) {
  if (i === 4) {
    totalesFila1 = crearFilaTotales("Totales");
    crearFilaEtiquetaF("EQUIPO ROJO");
  }

  const fila = document.createElement('div');
  fila.classList.add('fila');

  const inputNombre = document.createElement('input');
  inputNombre.type = 'text';
  inputNombre.placeholder = 'NOMBRE';
  inputNombre.classList.add('nombre-input');
  inputNombre.style.width = '60px';
  inputNombre.style.marginRight = '5px';
  inputNombre.style.fontFamily = "Tahoma";
  inputNombre.style.fontWeight = "bold";
  inputNombre.style.fontStyle = "normal";

inputNombre.addEventListener('keydown', (e) => {
  if (e.key === "ArrowRight" || e.key === "Tab") {
    e.preventDefault();
    seleccionarCelda(filasCeldas[i][0]);
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    e.stopPropagation(); // Esto evita que el evento se propague al manejador general
    if (i + 1 < inputNombres.length) {
      seleccionarCelda(inputNombres[i + 1]);
    }
  }
});
inputNombre.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  seleccionarCelda(filasCeldas[i][0]);
});



  fila.appendChild(inputNombre);
  inputNombres.push(inputNombre);

  const celdasFila = [];

  for (let j = 0; j < columnas; j++) {
    const celda = document.createElement('input');
    celda.type = 'text';
    celda.classList.add('celda');
    if (j % 2 === 0) celda.classList.add('par');
    celda.readOnly = true;
    celda.style.cursor = 'pointer';
    bloquearSiEsColumnaEspecial(celda, j); 
    if (j === 0) celda.style.marginLeft = '8px';
    celda.addEventListener('click', () => seleccionarCelda(celda));
    fila.appendChild(celda);
    celdasFila.push(celda);
  }

  filasCeldas.push(celdasFila);
  container.appendChild(fila);
}

totalesFila2 = crearFilaTotales("Totales");

function recalcularTotalesAcumulados() {
  let acumuladoA = 0;
  let acumuladoB = 0;
  let ultimaColumna = -1;
  for (let col = 0; col < 20; col++) {
    for (let i = 0; i < 8; i++) {
      const valorBase = valores[i][col];
      const celda = filasCeldas[i][col];
      if (typeof valorBase === 'number' || celda.classList.contains('contorno-rojo')) {
        ultimaColumna = col;
        break;
      }
    }
    if (ultimaColumna < col) {
      const valF0 = parseInt(filasF[0][col].value);
      const valF1 = parseInt(filasF[1][col].value);
      if (!isNaN(valF0) || !isNaN(valF1)) {
        ultimaColumna = col;
      }
    }
  }

  for (let col = 0; col < 20; col++) {
    if (col > ultimaColumna) {
      totales[0][col] = '';
      totales[1][col] = '';
      continue;
    }

    let sumaColumnaA = 0;
    for (let i = 0; i < 4; i++) {
      const valorBase = valores[i][col];
      const celda = filasCeldas[i][col];
      if (typeof valorBase === 'number') {
        const penalizacion = celda.classList.contains('contorno-rojo') ? 5 : 0;
        sumaColumnaA += valorBase - penalizacion;
      }
    }
    const valF0 = parseInt(filasF[0][col].value);
    if (!isNaN(valF0)) sumaColumnaA += valF0;

    acumuladoA += sumaColumnaA;
    totales[0][col] = acumuladoA;

    let sumaColumnaB = 0;
    for (let i = 4; i < 8; i++) {
      const valorBase = valores[i][col];
      const celda = filasCeldas[i][col];
      if (typeof valorBase === 'number') {
        const penalizacion = celda.classList.contains('contorno-rojo') ? 5 : 0;
        sumaColumnaB += valorBase - penalizacion;
      }
    }
    const valF1 = parseInt(filasF[1][col].value);
    if (!isNaN(valF1)) sumaColumnaB += valF1;

    acumuladoB += sumaColumnaB;
    totales[1][col] = acumuladoB;
  }

  for (let col = 20; col < columnas; col++) {
    totales[0][col] = '';
    totales[1][col] = '';
  }

  totales[0][24] = totales[0][ultimaColumna] || '';
  totales[1][24] = totales[1][ultimaColumna] || '';
}

const contenedorBotonesLaterales = document.createElement("div");
contenedorBotonesLaterales.classList.add("contenedor-botones-laterales");

function crearColumna(titulo, inicio, fin) {
  const contenedor = document.createElement("div");
  contenedor.classList.add("columna-botones");

  const label = document.createElement("div");
  label.textContent = titulo;
  label.classList.add("titulo-columna");
  contenedor.appendChild(label);

  for (let i = inicio; i <= fin; i++) {
    const btn = document.createElement("button");
    btn.textContent = `${i}`;
    btn.dataset.numeroOriginal = `${i}`;
    btn.classList.add("btn-selector", "boton-lateral");

if (titulo === "A") {
  btn.dataset.estado = "normal";

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    avanzarEstadoBoton(btn);
  });
}
if (titulo === "T.F") {
  btn.dataset.estado = "normal";

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    avanzarEstadoBotonTF(btn);
  });
}

    contenedor.appendChild(btn);
  }

  return contenedor;
}
const grupoArriba = document.createElement("div");
grupoArriba.classList.add("grupo-botones");

const columnaTF1 = crearColumna("T.F", 1, 3);
const columnaA1 = crearColumna("A", 1, 3);
grupoArriba.appendChild(columnaTF1);
grupoArriba.appendChild(columnaA1);
const grupoAbajo = document.createElement("div");
grupoAbajo.classList.add("grupo-botones");

const columnaTF2 = crearColumna("T.F", 1, 3);
const columnaA2 = crearColumna("A", 1, 3);
grupoAbajo.appendChild(columnaTF2);
grupoAbajo.appendChild(columnaA2);

contenedorBotonesLaterales.appendChild(grupoArriba);
contenedorBotonesLaterales.appendChild(grupoAbajo);
document.body.appendChild(contenedorBotonesLaterales);

function avanzarEstadoBoton(btn) {
  const estadoActual = btn.dataset.estado;

  if (estadoActual === "normal") {
    marcarPalomita(btn);
  } else if (estadoActual === "palomita") {
    marcarCirculo(btn);
  } else if (estadoActual === "circulo") {
    limpiarBoton(btn);
  } else {
    limpiarBoton(btn);
  }
}

function avanzarEstadoBotonTF(btn) {
  const estadoActual = btn.dataset.estado;

  if (estadoActual === "normal") {
    marcarTacha(btn);
  } else if (estadoActual === "tacha") {
    limpiarBoton(btn);
  } else {
    limpiarBoton(btn);
  }
}
function marcarPalomita(btn) {
  btn.classList.add("activo");
  btn.innerHTML = `<span class="marca-paloma"></span>`;
  btn.style.color = "inherit";
  btn.dataset.estado = "palomita";
}

function marcarCirculo(btn) {
  btn.classList.add("activo");
  btn.dataset.estado = "circulo";
  btn.style.position = "relative";
  btn.innerHTML = '<span class="marca-circulo"></span>';
  btn.style.color = "inherit";
}


function marcarTacha(btn) {
  btn.classList.add("activo");
  btn.innerHTML = `<span class="marca-tacha"></span>`;
  btn.style.color = "inherit";
  btn.dataset.estado = "tacha";
}


function limpiarBoton(btn) {
  btn.classList.remove("activo");
  btn.innerHTML = btn.dataset.numeroOriginal;
  btn.style.color = "#000";
  btn.dataset.estado = "normal";

  if (celdaSeleccionada) {
    const esCeldaDeFalta = filasF.some(filaF => filaF.includes(celdaSeleccionada));
    if (esCeldaDeFalta) {
      celdaSeleccionada.readOnly = true;
      celdaSeleccionada.style.cursor = 'pointer';
    } else {
      celdaSeleccionada.readOnly = true; 
      celdaSeleccionada.style.cursor = 'pointer';
    }
  }
}


function actualizarTotalesUI() {
  for (let col = 0; col < columnas; col++) {
    totalesFila1[col].value = totales[0][col] !== '' ? totales[0][col] : '';
    totalesFila2[col].value = totales[1][col] !== '' ? totales[1][col] : '';
  }

  if (mostrarColumnaT) {
    let totalGrupo1 = parseInt(totalesFila1[24].value) || 0;
    let totalGrupo2 = parseInt(totalesFila2[24].value) || 0;

    let totalFinal = totalGrupo1 + totalGrupo2;
    let sumaF = 0;
    filasF.forEach(filaF => {
      for (let col = 0; col < columnas; col++) {
        const celda = filaF[col];
        const val = parseInt(celda.value);
        if (!isNaN(val)) {
          sumaF += val;
        }
      }
    });

    totalFinal += sumaF;

    totalesFila1[24].value = totalFinal > 0 ? totalFinal : '';
  } else {
    totalesFila1[24].value = '';
  }
}

function actualizarTotalesFila() {
  for (let fila = 0; fila < filas; fila++) {
    const tieneNombre = inputNombres[fila].value.trim() !== '';
    if (!tieneNombre) continue;

    let suma = 0;
    let correctas = 0;

    for (let col = 0; col < 20; col++) {
      const celda = filasCeldas[fila][col];
      const valorBase = valores[fila][col];

      if (typeof valorBase === 'number' && !isNaN(valorBase)) {
        const penalizacion = celda.classList.contains('contorno-rojo') ? 5 : 0;
        const valorFinal = valorBase - penalizacion;
        suma += valorFinal;

        if ([10, 20, 30].includes(valorBase)) {
          correctas++;
        }
      }
    }
    const colB = 23;
    let bono = 0;
    if (correctas >= 5) {
      bono = 20;
      filasCeldas[fila][colB].value = "+20";
      filasCeldas[fila][colB].readOnly = true;
      filasCeldas[fila][colB].style.cursor = 'default';
    } else {
      filasCeldas[fila][colB].value = "";
    }
    suma += bono;
    for (let col = 20; col <= 22; col++) {
      const celda = filasCeldas[fila][col];
      const valorBase = valores[fila][col];

      if (typeof valorBase === 'number' && !isNaN(valorBase)) {
        const penalizacion = celda.classList.contains('contorno-rojo') ? 5 : 0;
        suma += valorBase - penalizacion;
      }
    }
    if (mostrarColumnaT) {
      filasCeldas[fila][24].value = Number.isFinite(suma) && suma !== 0 ? suma : '';
    } else {
      filasCeldas[fila][24].value = '';
    }
  }

  if (mostrarColumnaT) {
    for (let grupo = 0; grupo < 2; grupo++) {
      const filaInicio = grupo * 4;
      const filaFin = filaInicio + 4;
      const filaTotal = grupo === 0 ? totalesFila1 : totalesFila2;

      let sumaGrupo = 0;
      for (let fila = filaInicio; fila < filaFin; fila++) {
        const val = filasCeldas[fila][24].value;
        const num = Number(val);
        if (!isNaN(num)) sumaGrupo += num;
      }

      const filaF = filasF[grupo];
      let faltas = 0;
      for (let col = 0; col < 24; col++) {
        const celda = filaF[col];
        const val = parseInt(celda.value);
        if (!isNaN(val)) {
          faltas += val;
        }
      }
      const totalFinal = sumaGrupo + faltas;
      filaTotal[24].value = totalFinal > 0 ? totalFinal : '';
    }
  } else {
    totalesFila1[24].value = '';
    totalesFila2[24].value = '';
  }
}
document.querySelectorAll('.valor-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!celdaSeleccionada) return;

    const esCeldaFalta = filasF.some(filaF => filaF.includes(celdaSeleccionada));
    const textoBtn = btn.textContent.trim();

    if (esCeldaFalta) {
      if (textoBtn.toLowerCase() === 'f') {
        if (celdaSeleccionada.value === "-5") {
          celdaSeleccionada.value = "";
          celdaSeleccionada.classList.remove('contorno-rojo');
          celdaSeleccionada.style.backgroundColor = "";
        } else {
          celdaSeleccionada.value = "-5";
          celdaSeleccionada.classList.add('contorno-rojo');
          celdaSeleccionada.style.backgroundColor = "#ffb3b3";
        }

        recalcularTotalesAcumulados();
        actualizarTotalesUI();
        actualizarTotalesFila();
      }
      return;
    }
    const valorBtn = parseInt(textoBtn);
    if (!isNaN(valorBtn)) {
      asignarValor(valorBtn);
    }
  });
});


function asignarValor(valorBtn) {
  const indexVAL = filaValoresPreguntaInputs.indexOf(celdaSeleccionada);
if (indexVAL !== -1) {
  if ([10, 20, 30].includes(valorBtn) || [-5, -10, -15].includes(valorBtn)) {
    celdaSeleccionada.dataset.valorBase = valorBtn;

    const tieneFalta = celdaSeleccionada.classList.contains('contorno-rojo');
  let nuevo = valorBtn;
  if (valorBtn > 0 && tieneFalta) {
    nuevo = valorBtn - 5;
}


    celdaSeleccionada.value = nuevo;
    celdaSeleccionada.style.backgroundColor = tieneFalta ? "#ffb3b3" : "";
  }
  seleccionarCelda(celdaSeleccionada);
  return;
}


  const esCeldaDeF = filasF.some(filaF => filaF.includes(celdaSeleccionada));
  if (esCeldaDeF) {
    let actual = parseInt(celdaSeleccionada.value) || 0;
    let nuevo = actual + valorBtn;
    celdaSeleccionada.value = nuevo;

    if (valorBtn < 0) {
      celdaSeleccionada.classList.add('contorno-rojo');
      celdaSeleccionada.style.backgroundColor = "#ffb3b3";
    } else {
      celdaSeleccionada.classList.remove('contorno-rojo');
      celdaSeleccionada.style.backgroundColor = "";
    }

    recalcularTotalesAcumulados();
    actualizarTotalesUI();
    actualizarTotalesFila();
    return;
  }
  const colIndex = Array.from(celdaSeleccionada.parentElement.children).indexOf(celdaSeleccionada) - 1;
  const filaIndex = filasCeldas.findIndex(f => f.includes(celdaSeleccionada));
  if (colIndex < 0 || filaIndex < 0) return;

  valores[filaIndex][colIndex] = valorBtn;
  celdaSeleccionada.dataset.valorBase = valorBtn;

  const tieneFalta = celdaSeleccionada.classList.contains('contorno-rojo');
  const penalizacion = tieneFalta ? 5 : 0;
  const nuevo = valorBtn - penalizacion;

  celdaSeleccionada.value = nuevo;
  celdaSeleccionada.style.backgroundColor = tieneFalta ? "#ffb3b3" : "";

  if ([10, 20, 30].includes(valorBtn) && colIndex < 20) {
    columnasBloqueadas[colIndex] = true;
    for (let f = 0; f < filas; f++) {
      filasCeldas[f][colIndex].readOnly = true;
      filasCeldas[f][colIndex].style.cursor = 'default';
    }
  }

  recalcularTotalesAcumulados();
  actualizarTotalesUI();
  actualizarTotalesFila();
}

function sincronizarValoresDesdeCeldas() {
  for (let fila = 0; fila < filas; fila++) {
    for (let col = 0; col < columnas; col++) {
      const celda = filasCeldas[fila][col];
      const valor = parseInt(celda.value);
      valores[fila][col] = !isNaN(valor) ? valor : null;
    }
  }
}
function bloquearSiEsColumnaEspecial(celda, colIndex) {
  if ([0, 23, 24].includes(colIndex)) {
    celda.readOnly = true;
    celda.style.cursor = 'default';
    celda.tabIndex = -1;
    celda.addEventListener('focus', (e) => e.target.blur());
    celda.addEventListener('click', (e) => e.preventDefault());
    celda.style.backgroundColor = '#e6e6e6';
  }
}


document.querySelector('.borrar-btn').addEventListener('click', () => {
  if (!celdaSeleccionada) return;

  const indexVAL = filaValoresPreguntaInputs.indexOf(celdaSeleccionada);
  if (indexVAL !== -1) {
    celdaSeleccionada.value = '';
    celdaSeleccionada.classList.remove('contorno-rojo');
    celdaSeleccionada.style.backgroundColor = '';
    celdaSeleccionada.readOnly = true; // Mantener como solo lectura
    seleccionarCelda(celdaSeleccionada);
    return;
  }

  const esCeldaFaltaBorrar = filasF.some(filaF => filaF.includes(celdaSeleccionada));
  if (esCeldaFaltaBorrar) {
    celdaSeleccionada.value = '';
    celdaSeleccionada.classList.remove('contorno-rojo');
    celdaSeleccionada.style.backgroundColor = '';
    celdaSeleccionada.readOnly = true; // Mantener como solo lectura
    celdaSeleccionada.style.cursor = 'pointer';
    seleccionarCelda(celdaSeleccionada);
    recalcularTotalesAcumulados();
    actualizarTotalesUI();
    actualizarTotalesFila();
    return;
  }

  const colIndex = Array.from(celdaSeleccionada.parentElement.children).indexOf(celdaSeleccionada) - 1;
  const filaIndex = filasCeldas.findIndex(f => f.includes(celdaSeleccionada));

  if (colIndex < 0 || filaIndex < 0) return;

  valores[filaIndex][colIndex] = null;

  celdaSeleccionada.value = '';
  celdaSeleccionada.classList.remove('contorno-rojo');
  celdaSeleccionada.style.backgroundColor = '';
  celdaSeleccionada.removeAttribute('data-valor-base');
  
  // Asegurar que la celda siempre sea de solo lectura
  celdaSeleccionada.readOnly = true;
  celdaSeleccionada.style.cursor = 'pointer';

  if (colIndex < 20) {
    let tienePositivos = false;
    for (let f = 0; f < filas; f++) {
      if ([10, 20, 30].includes(valores[f][colIndex])) {
        tienePositivos = true;
        break;
      }
    }

    if (!tienePositivos) {
      columnasBloqueadas[colIndex] = false;
      for (let f = 0; f < filas; f++) {
        // Mantener las celdas como solo lectura
        filasCeldas[f][colIndex].readOnly = true;
        filasCeldas[f][colIndex].style.cursor = 'pointer';
      }
    }
  }

  recalcularTotalesAcumulados();
  actualizarTotalesUI();
  actualizarTotalesFila();
  seleccionarCelda(celdaSeleccionada);
});

document.addEventListener('keydown', (e) => {
  if (!celdaSeleccionada) return;

  // NUEVA LÓGICA: Permitir escritura normal en campos de texto editables
  const esCampoTextoEditable = celdaSeleccionada.classList.contains('nombre-input') || 
                               celdaSeleccionada.classList.contains('nombre-equipo-verde') || 
                               celdaSeleccionada.classList.contains('nombre-equipo-rojo');

  // Si es un campo de texto editable, solo interceptar las teclas de navegación
  if (esCampoTextoEditable) {
    // Solo manejar navegación para campos de texto
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const filaIndex = inputNombres.indexOf(celdaSeleccionada);
      if (filaIndex !== -1 && filaIndex + 1 < inputNombres.length) {
        seleccionarCelda(inputNombres[filaIndex + 1]);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const filaIndex = inputNombres.indexOf(celdaSeleccionada);
      if (filaIndex !== -1 && filaIndex > 0) {
        seleccionarCelda(inputNombres[filaIndex - 1]);
      }
    } else if (e.key === "ArrowRight" || e.key === "Tab") {
      e.preventDefault();
      const filaIndex = inputNombres.indexOf(celdaSeleccionada);
      if (filaIndex !== -1) {
        seleccionarCelda(filasCeldas[filaIndex][0]);
      }
    }
    // Para cualquier otra tecla en campos de texto, permitir comportamiento normal
    return;
  }

  // RESTO DEL CÓDIGO ORIGINAL PARA CELDAS NO EDITABLES
  const esCeldaFalta = filasF.some(filaF => filaF.includes(celdaSeleccionada));

  if (esCeldaFalta) {
    if (e.key.toLowerCase() === 'f') {
      e.preventDefault();

      const actual = parseInt(celdaSeleccionada.value) || 0;

      if (actual === -5) {
        celdaSeleccionada.value = "";
        celdaSeleccionada.classList.remove('contorno-rojo');
        celdaSeleccionada.style.backgroundColor = "";
        setTimeout(() => {
          if (celdaSeleccionada.value.trim() === "0") {
            celdaSeleccionada.value = "";
          }
        }, 0);
      } else {
        // Poner falta
        celdaSeleccionada.value = "-5";
        celdaSeleccionada.classList.add('contorno-rojo');
        celdaSeleccionada.style.backgroundColor = "#ffb3b3";
      }

      recalcularTotalesAcumulados();
      actualizarTotalesUI();
      actualizarTotalesFila();
    } else {
      e.preventDefault();
    }
    return;
  }

  const teclaValorMap = {
    "1": 10,
    "2": 20,
    "3": 30,
    "4": -5,
    "5": -10,
    "6": -15
  };

  if (teclaValorMap.hasOwnProperty(e.key)) {
    e.preventDefault();
    asignarValor(teclaValorMap[e.key]);
    return;
  }

  const maxFila = filas - 1;
  const maxCol = columnas - 1;

  let filaIndex = filasCeldas.findIndex(f => f.includes(celdaSeleccionada));
  let colIndex = -1;

  let esNombre = false;

  if (filaIndex === -1) {
    filaIndex = inputNombres.indexOf(celdaSeleccionada);
    if (filaIndex !== -1) {
      esNombre = true;
    }
  }

  let esFilaPregunta = false;
  if (filaIndex === -1) {
    colIndex = filaValoresPreguntaInputs.indexOf(celdaSeleccionada);
    if (colIndex !== -1) {
      esFilaPregunta = true;
    }
  }

  if (!esNombre && !esFilaPregunta) {
    colIndex = filasCeldas[filaIndex].indexOf(celdaSeleccionada);
  }

  const esColumnaBloqueada = (col) => col === 23 || col === 24;

  const siguienteColumna = (col) => {
    let nuevaCol = (col + 1) % columnas;
    while (esColumnaBloqueada(nuevaCol)) {
      nuevaCol = (nuevaCol + 1) % columnas;
    }
    return nuevaCol;
  };

  const anteriorColumna = (col) => {
    let nuevaCol = (col - 1 + columnas) % columnas;
    while (esColumnaBloqueada(nuevaCol)) {
      nuevaCol = (nuevaCol - 1 + columnas) % columnas;
    }
    return nuevaCol;
  };

  switch (e.key) {
    case "ArrowRight":
      if (e.target.classList.contains('nombre-input')) return;
      e.preventDefault();
      if (colIndex !== -1) {
        const nuevaCol = siguienteColumna(colIndex);
        if (esFilaPregunta) {
          seleccionarCelda(filaValoresPreguntaInputs[nuevaCol]);
        } else {
          seleccionarCelda(filasCeldas[filaIndex][nuevaCol]);
        }
      }
      break;

    case "ArrowLeft":
      e.preventDefault();
      if (colIndex !== -1) {
        const nuevaCol = anteriorColumna(colIndex);
        if (colIndex === 0 && !esFilaPregunta) {
          seleccionarCelda(inputNombres[filaIndex]);
        } else {
          if (esFilaPregunta) {
            seleccionarCelda(filaValoresPreguntaInputs[nuevaCol]);
          } else {
            seleccionarCelda(filasCeldas[filaIndex][nuevaCol]);
          }
        }
      }
      break;

    case "ArrowUp":
      e.preventDefault();
      if (esNombre) {
        if (filaIndex > 0) seleccionarCelda(inputNombres[filaIndex - 1]);
      } else if (esFilaPregunta) {
        
      } else {
        if (filaIndex > 0) seleccionarCelda(filasCeldas[filaIndex - 1][colIndex]);
        else if (filaIndex === 0) seleccionarCelda(filaValoresPreguntaInputs[colIndex]);
      }
      break;

    case "ArrowDown":
      e.preventDefault();
      if (esFilaPregunta) {
        seleccionarCelda(filasCeldas[0][colIndex]);
      } else {
        if (filaIndex < maxFila) seleccionarCelda(filasCeldas[filaIndex + 1][colIndex]);
      }
      break;
  }

  if (e.key.toLowerCase() === 'f') {
    e.preventDefault();
    const botonF = document.querySelector('.boton-faltas');
    if (botonF) botonF.click();
  }
});

document.querySelector('.boton-faltas').addEventListener('click', () => {
  if (!celdaSeleccionada) return;
  
  const esCeldaDeF = filasF.some(filaF => filaF.includes(celdaSeleccionada));
  
  if (esCeldaDeF) {
    // Comportamiento para celdas de faltas (filas F)
    if (celdaSeleccionada.value === "-5") {
      // Eliminar completamente si ya tiene falta
      celdaSeleccionada.value = "";
      celdaSeleccionada.classList.remove('contorno-rojo');
      celdaSeleccionada.style.backgroundColor = "";
    } else {
      // Establecer falta si está vacía
      celdaSeleccionada.value = "-5";
      celdaSeleccionada.classList.add('contorno-rojo');
      celdaSeleccionada.style.backgroundColor = "#ffb3b3";
    }
  } else {
    // Comportamiento para celdas normales (mantener toggle de penalización)
    const filaIndex = filasCeldas.findIndex(f => f.includes(celdaSeleccionada));
    const colIndex = filaIndex !== -1 ? filasCeldas[filaIndex].indexOf(celdaSeleccionada) : -1;
    if (filaIndex === -1 || colIndex === -1) return;

    const yaTieneFalta = celdaSeleccionada.classList.contains('contorno-rojo');
    const penalizacion = yaTieneFalta ? 0 : 5;
    const valorBase = parseInt(celdaSeleccionada.dataset.valorBase) || 0;
    const nuevo = yaTieneFalta ? valorBase : valorBase - 5;

    celdaSeleccionada.value = nuevo;

    if (yaTieneFalta) {
      celdaSeleccionada.classList.remove('contorno-rojo');
      celdaSeleccionada.style.backgroundColor = "";
    } else {
      celdaSeleccionada.classList.add('contorno-rojo'); 
    }

    valores[filaIndex][colIndex] = valorBase;
  }
  
  // Recalcular totales en ambos casos
  recalcularTotalesAcumulados();
  actualizarTotalesUI();
  actualizarTotalesFila();
});
});
