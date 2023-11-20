window.addEventListener("DOMContentLoaded", () => {
    let todosCirculos;
    let todosCirculosIndicadores;

    let codigoSecreto = [];

    let ajustesjuego = {size: 4, max:6, dim: 6};

    let variablesjuego = {
        ordenCirculos: 0,
        brakePointsCirculos: [],
        patron: []
    };

    const colorAleatorio = () => {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return "rgb(" + r + ", " + g + ", " + b + ")";
    };
    const agregarCirculosAlContenedor = (contenedor, cantidad, contenidoCirculo) => {
        for (let i = 0; i < cantidad; i++) {
            const elementoCirculo = document.createElement("div");
            elementoCirculo.classList.add("circulos");
            elementoCirculo.textContent = contenidoCirculo;

            contenedor.append(elementoCirculo);
        }
    };
    const mostrarPatronClave = (patronSecreto) => {
        let circulosPaletaColor = document.querySelectorAll("#colores>.circulos");
        let circulosFilaPatron = document.querySelectorAll("#fila-patron>.circulos");

        circulosFilaPatron.forEach((el, index) => {
            el.style.backgroundColor = circulosPaletaColor[patronSecreto[index]].style.backgroundColor;
            el.style.color = "purple";
        });
    };
    const colorearCirculosIndicadores = (resultado, puntosQuiebreCirculos, maximo, size) => {
        const todosCirculosIndicadores = document.querySelectorAll("#solucion .pista-container > .circulos");
        const morado = resultado.morado || 0;
        const blanco = resultado.blanco || 0;

        let puntoQuiebre = 0;
        if (maximo !== 0) {
            puntoQuiebre = puntosQuiebreCirculos.shift() - size;
        }
        // pintar en blanco
        for (let i = puntoQuiebre; i < puntoQuiebre + blanco; i++) {
            todosCirculosIndicadores[i].style.backgroundColor = "white";
        }
        // pintar en morado
        for (let i = puntoQuiebre; i < puntoQuiebre + morado; i++) {
            todosCirculosIndicadores[i].style.backgroundColor = "purple";
        }
    };
    const obtenerPuntosQuiebre = (maximo, size) => {
        const puntosQuiebre = [];
        if (maximo !== 0) {
            for (let i = 1; i < maximo + 1; i++) {
                puntosQuiebre.push(size * i);
            }
        } else {
            puntosQuiebre.push(size);
        }
        return puntosQuiebre;
    };
    const revisarPorBlanco = (patronClave, patronPrueba) => {
        return patronPrueba.reduce((acc, val) => {
            let indiceEncontrado = patronClave.indexOf(val);
            if (indiceEncontrado >= 0) {
                patronClave = patronClave.filter((el, index) => {
                    return indiceEncontrado !== index;
                });
                return acc + 1;
            } else {
                return acc;
            }
        }, 0);
    };
    const revisarPorMorado = (patronClave, patronPrueba) => {
        return patronClave.reduce((acc, valor, index) => {
            return acc += patronPrueba[index] === valor ? 1 : 0;
        }, 0);
    };

    const limpiarTableroJuego = () => {
        const body = document.querySelector("body");
        const paletaColor = document.querySelector("#colores");
        const columnaRespuesta = document.querySelector("#solucion");
        paletaColor.innerHTML = "";
        columnaRespuesta.innerHTML = "";

        body.style.backgroundColor = "#f79071";
    };
    const renderizarTableroJuego = (configuracionJuego, seleccionarColorFun) => {
        limpiarTableroJuego();
        const tituloJuego = document.querySelector("#titulojuego");
        tituloJuego.textContent = "Completa el desafío";
        const columnaRespuesta = document.querySelector("#solucion");
        const paletaColor = document.querySelector("#colores");

        let maximo = 1;
        if (configuracionJuego.max !== 0) {
            maximo = configuracionJuego.max;
        }

        /* creando filas de círculos vacíos con indicadores/resultados */
        for (let j = 0; j < maximo; j++) {
            // contenedor con círculos de respuesta e indicadores 
            const contenedorIntento = document.createElement("div");
            contenedorIntento.classList.add("adivinar-container");

            // creación de círculos de respuesta
            const filaRespuesta = document.createElement("div");
            filaRespuesta.classList.add("circulos-container");

            // creando una fila de círculos del tamaño 'n'
            agregarCirculosAlContenedor(filaRespuesta, configuracionJuego.size);

            // creación de círculos de indicadores
            const contenedorIndicadores = document.createElement("div");
            contenedorIndicadores.classList.add("pista-container");
            // ajustar tamaño dinámico para que la cuadrícula automática se envuelva
            contenedorIndicadores.style.width = `${configuracionJuego.size * 0.76}rem`;
            agregarCirculosAlContenedor(contenedorIndicadores, configuracionJuego.size);

            // agregar ambos al contenedor de intento
            contenedorIntento.append(filaRespuesta);
            contenedorIntento.append(contenedorIndicadores);

            columnaRespuesta.append(contenedorIntento);
        }

        // creación de fila de patrón secreto
        const filaPatron = document.createElement("div");
        filaPatron.classList.add("circulos-container");
        filaPatron.setAttribute("id", "fila-patron");

        agregarCirculosAlContenedor(filaPatron, configuracionJuego.size, "?");
        columnaRespuesta.append(filaPatron);

        agregarCirculosAlContenedor(paletaColor, configuracionJuego.dim, "");
        // colorear círculos en el contenedor de la paleta
        paletaColor.childNodes.forEach((el, index) => {
            if (el.tagName === "DIV") {
                const colorEl = colorAleatorio();
                el.style.backgroundColor = colorEl;
                el.addEventListener("click", () => seleccionarColorFun(colorEl, index));
            }
        });

    };
    const renderizarResultadoJuego = ({ gameOver, win, mensaje, codigoSecreto }) => {
        if (win || gameOver) {
            const tituloJuego = document.querySelector("#titulojuego");
            const body = document.querySelector("body");
            if (win) {
                body.style.backgroundColor = "#5FFF7F";
            } else {
                body.style.backgroundColor = "#FF483D";
            }
            tituloJuego.textContent = mensaje;
            mostrarPatronClave(codigoSecreto);
        }
    };

    const generarPatronAleatorio = (size, dim) => {
        let patronSecreto = [],
            contador = size;

        while (contador > 0) {
            patronSecreto.push(Math.floor(Math.random() * dim));
            contador--;
        }
        return patronSecreto;
    };
    const revisarMiPatron = () => {
        const blanco = revisarPorBlanco(codigoSecreto, variablesjuego.patron);
        const morado = revisarPorMorado(codigoSecreto, variablesjuego.patron);

        let gameOver = false, win = false;
        if (ajustesjuego.size * ajustesjuego.max === variablesjuego.ordenCirculos) {
            gameOver = true;
        }
        if (morado === ajustesjuego.size) {
            win = true;
        }
        colorearCirculosIndicadores({ blanco, morado }, variablesjuego.brakePointsCirculos, ajustesjuego.max, ajustesjuego.size);
        renderizarResultadoJuego({ gameOver, win, mensaje: win ? "¡ENHORABUENA, MASTERMIND!" : "GAME OVER", codigoSecreto });
        if (win) {
            variablesjuego.ordenCirculos = ajustesjuego.max * ajustesjuego.size;
        }
        variablesjuego.patron = [];
    };
    const seleccionarUnColor = (color, index) => {
        if (todosCirculos.length - 1 >= variablesjuego.ordenCirculos) {

            todosCirculos[variablesjuego.ordenCirculos].style.backgroundColor = color;

            // modo interminable
            if (ajustesjuego.max === 0 && variablesjuego.ordenCirculos === 0) {
                todosCirculos[ajustesjuego.size - 1].style.borderColor = "#006975";

                // volver a colorear los círculos de indicadores a vacíos
                todosCirculosIndicadores.forEach(circulos => {
                    circulos.style.backgroundColor = "#fa744f";
                });
            }

            // borde del círculo actual
            if (variablesjuego.ordenCirculos !== 0) {
                todosCirculos[variablesjuego.ordenCirculos - 1].style.borderColor = "#006975";
            }
            todosCirculos[variablesjuego.ordenCirculos].style.borderColor = "#024249";
            variablesjuego.ordenCirculos += 1;
            variablesjuego.patron.push(index);

            let indiceDeBreakpoints = variablesjuego.brakePointsCirculos.indexOf(variablesjuego.ordenCirculos);
            if (indiceDeBreakpoints >= 0 || (ajustesjuego.max === 0 && variablesjuego.ordenCirculos === ajustesjuego.size)) {
                revisarMiPatron();
                if (ajustesjuego.max === 0 && variablesjuego.ordenCirculos === ajustesjuego.size) {
                    variablesjuego.ordenCirculos = 0;
                }
            }
        }
    };
    const quitarColor = () => {
        if (variablesjuego.brakePointsCirculos.length > 0 && variablesjuego.brakePointsCirculos[0] - ajustesjuego.size !== variablesjuego.ordenCirculos) {

            todosCirculos[variablesjuego.ordenCirculos - 1].style.borderColor = "#006975";

            variablesjuego.ordenCirculos--;
            todosCirculos[variablesjuego.ordenCirculos].style.backgroundColor = "#006975";
            variablesjuego.patron.pop();

            if (variablesjuego.ordenCirculos > 0) {
                todosCirculos[variablesjuego.ordenCirculos - 1].style.borderColor = "#024249";
            }

        }
    };
    const establecerNuevosValoresJuego = () => {
        todosCirculos = document.querySelectorAll("#solucion > .adivinar-container .circulos-container > .circulos");
        todosCirculosIndicadores = document.querySelectorAll("#solucion .pista-container > .circulos");
        variablesjuego = {
            ordenCirculos: 0,
            brakePointsCirculos: obtenerPuntosQuiebre(ajustesjuego.max, ajustesjuego.size),
            patron: []
        };
    };
    const crearNuevoJuego = () => {

        ajustesRangoEntrada.forEach(input => {
            const inputRange = input.querySelector("input");
            ajustesjuego[`${inputRange.name}`] = Number(inputRange.value);
        });
        renderizarTableroJuego(ajustesjuego, seleccionarUnColor);
        establecerNuevosValoresJuego();
        codigoSecreto = generarPatronAleatorio(ajustesjuego.size, ajustesjuego.dim);
    };

    // BOTÓN DE NUEVO JUEGO
    const botonNuevoJuego = document.querySelector("#nuevojuego-btn");
    botonNuevoJuego.addEventListener("click", crearNuevoJuego);

   // BOTÓN DE BORRAR
   const botonBorrar = document.querySelector("#retroceder");
   botonBorrar.addEventListener("click", quitarColor);

   const toggleOpen = () => {
       if (cajonAjustes.classList.contains("open")) {
           cajonAjustes.classList.remove("open");
       } else {
           cajonAjustes.classList.add("open");
       }
   };
   botonAjustes.addEventListener("click", toggleOpen);


});

 // AJUSTES DE RANGO DE ENTRADA
 const ajustesRangoEntrada = document.querySelectorAll("seleccion-dificultad");
 ajustesRangoEntrada.forEach(input => {
     const rangoEntrada = input.querySelector("button");
     rangoEntrada.addEventListener("button", (e) => {
         etiquetaSpan.textContent = e.target.value;
     });
     etiquetaSpan.textContent = ajustesjuego[`${rangoEntrada.name}`];
     rangoEntrada.value = ajustesjuego[`${rangoEntrada.name}`];
 });
 
 renderizarTableroJuego(ajustesjuego, seleccionarUnColor);
 establecerNuevosValoresJuego();
 codigoSecreto = generarPatronAleatorio(ajustesjuego.size, ajustesjuego.dim);
 

