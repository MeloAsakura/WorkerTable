/*==================== DOM ====================*/

const ladoDir = document.getElementById("ladoDir");
const ladoEsq = document.querySelector(".ladoEsq");
const seta = document.querySelector('.setaVoltar')
const menuLateral = document.getElementById('menuLateral')

/*==================== Constantes ====================*/

const MIN_W = 250;              // largura mínima do box
const MIN_H = 200;              // altura mínima do box
const MARGEM_BORDA = 10;        // faixa (px) em que o ponteiro "pega" a borda
const LIMIAR_ARRASTE = 5;       // movimento (px) para considerar que é arraste, não clique
const DURACAO_TRANSICAO = 700;  // deve acompanhar a transição CSS do .ladoEsq

/*==================== Utilitários ====================*/

// Mantém o valor entre min e max (se houver conflito, o min vence)
const limitarValor = (valor, min, max) => Math.max(min, Math.min(valor, max));

function posicionar(box, left, top) {
    box.style.left = `${left}px`;
    box.style.top = `${top}px`;
}

// Calcula a posição do box sem deixá-lo sair do ladoDir
function limitar(box, left, top) {
    return {
        left: limitarValor(left, 0, ladoDir.clientWidth - box.offsetWidth),
        top: limitarValor(top, 0, ladoDir.clientHeight - box.offsetHeight)
    };
}

function manterDentro() {
    document.querySelectorAll(".newBoxTable,.SandBox").forEach((box) => {
        const { left, top } = limitar(box, box.offsetLeft, box.offsetTop);
        posicionar(box, left, top);
    });
}

// Durante a transição do painel esquerdo, o ladoDir muda de tamanho:
// reposiciona os boxes a cada quadro para que não fiquem para fora
function acompanharTransicao(ms = DURACAO_TRANSICAO) {
    const fim = performance.now() + ms;

    function quadro() {
        manterDentro();
        if (performance.now() < fim) requestAnimationFrame(quadro);
    }
    quadro();
}

/*==================== Painel esquerdo e controles ====================*/

function mostrarControles(visivel) {
    seta.classList.toggle("visivel", visivel);
    menuLateral.classList.toggle("visivel", visivel);
}

function esconderPainelEsq() {
    ladoEsq.classList.add("escondido");
    mostrarControles(true);
    acompanharTransicao();
}

function mostrarPainelEsq() {
    ladoEsq.classList.remove("escondido");
    mostrarControles(false);
    document.querySelectorAll(".buttonRemoverNewBox").forEach((b) => {
        b.classList.remove("visivel");
    });
    acompanharTransicao();
}

ladoDir.addEventListener("click", (e) => {
    if (e.target.closest(".newBoxTable, .setaVoltar, .menuLateral,.SandBox")) return;
    esconderPainelEsq();
});

seta.addEventListener("click", mostrarPainelEsq);
window.addEventListener("resize", manterDentro);

/*==================== Bordas e redimensionamento ====================*/

// Retorna em qual borda o ponteiro está:
//   x: -1 esquerda | 1 direita | 0 nenhuma
//   y: -1 superior | 1 inferior | 0 nenhuma
function detectarBorda(event, box) {
    const r = box.getBoundingClientRect();
    const perto = (a, b) => Math.abs(a - b) <= MARGEM_BORDA;

    return {
        x: perto(event.clientX, r.left) ? -1 : perto(event.clientX, r.right) ? 1 : 0,
        y: perto(event.clientY, r.top) ? -1 : perto(event.clientY, r.bottom) ? 1 : 0
    };
}

function calcularEixo(borda, inicio, tamanho, delta, limite, minimo) {
    if (borda === 1) {
        return {
            pos: inicio,
            tam: limitarValor(tamanho + delta, minimo, limite - inicio)
        };
    }

    if (borda === -1) {
        const fim = inicio + tamanho;                       // lado oposto fica fixo
        const pos = limitarValor(inicio + delta, 0, fim - minimo);
        return { pos, tam: fim - pos };
    }

    return { pos: inicio, tam: tamanho };
}

function cursorDaBorda({ x, y }) {
    if (x && y) return x === y ? "nwse-resize" : "nesw-resize";
    if (x) return "ew-resize";
    if (y) return "ns-resize";
    return "";
}

/*==================== Arraste e redimensionamento de cada box ====================*/

function configurarArrasto(box) {
    let arrastando = false;
    let moveu = false;
    let redimensionar = false;

    let borda = { x: 0, y: 0 };
    let inicial = { left: 0, top: 0, width: 0, height: 0 };
    let inicio = { x: 0, y: 0 };
    let ultimo = { x: 0, y: 0 };
    let deslocamento = { x: 0, y: 0 };

    const btnRemover = box.querySelector(".buttonRemoverNewBox");
    box.style.maxHeight = "none";
    box.style.minWidth = `${MIN_W}px`;
    box.style.minHeight = `${MIN_H}px`;

    function moverParaPonteiro() {
        const dir = ladoDir.getBoundingClientRect();
        const { left, top } = limitar(
            box,
            ultimo.x - dir.left - ladoDir.clientLeft - deslocamento.x,
            ultimo.y - dir.top - ladoDir.clientTop - deslocamento.y
        );
        posicionar(box, left, top);
    }

    function redimensionarParaPonteiro() {
        const h = calcularEixo(
            borda.x, inicial.left, inicial.width,
            ultimo.x - inicio.x, ladoDir.clientWidth, MIN_W
        );
        const v = calcularEixo(
            borda.y, inicial.top, inicial.height,
            ultimo.y - inicio.y, ladoDir.clientHeight, MIN_H
        );

        posicionar(box, h.pos, v.pos);
        box.style.width = `${h.tam}px`;
        box.style.height = `${v.tam}px`;
    }

    function atualizar() {
        if (redimensionar) redimensionarParaPonteiro();
        else moverParaPonteiro();
    }

    // Um único ponto de atualização por quadro. Também cobre o caso do ponteiro
    // parado enquanto o ladoDir muda de tamanho pela transição do painel.
    function loop() {
        if (!arrastando) return;
        if (moveu) atualizar();
        requestAnimationFrame(loop);
    }

    function iniciarGesto(event) {
        arrastando = true;
        moveu = false;

        inicio = { x: event.clientX, y: event.clientY };
        ultimo = { ...inicio };

        borda = detectarBorda(event, box);
        redimensionar = borda.x !== 0 || borda.y !== 0;

        inicial = {
            left: box.offsetLeft,
            top: box.offsetTop,
            width: box.offsetWidth,
            height: box.offsetHeight
        };

        const rect = box.getBoundingClientRect();
        deslocamento = { x: event.clientX - rect.left, y: event.clientY - rect.top };

        box.setPointerCapture(event.pointerId);
        requestAnimationFrame(loop);
    }

    function aoComecarAMover() {
        moveu = true;
        ladoEsq.classList.add("escondido");
        mostrarControles(false);
        btnRemover?.classList.add("visivel");
    }

    function finalizarGesto(event) {
        if (!arrastando) return;

        ultimo = { x: event.clientX, y: event.clientY };
        if (moveu) atualizar();                 // aplica a posição final exata

        arrastando = false;
        redimensionar = false;

        if (box.hasPointerCapture(event.pointerId)) {
            box.releasePointerCapture(event.pointerId);
        }

        if (ladoEsq.classList.contains("escondido")) mostrarControles(true);
    }

    let ultimoPress=0

    box.addEventListener("pointerdown", (event) => {
        if (event.button !== 0 || arrastando) return;
        if (
            box.closest('.armazenamentoPasta') &&
            box.classList.contains('expandida')
        ) {
            return;
        }
        const agora = performance.now();
        const dbClick = agora - ultimoPress < 300;
        ultimoPress = agora;

        if (dbClick) return;

        if (event.target.closest("input, button, label, li")) return;
        iniciarGesto(event);
    });

    box.addEventListener("pointermove", (event) => {
        if (!arrastando) {
            box.style.cursor = cursorDaBorda(detectarBorda(event, box));
            return;
        }

        ultimo = { x: event.clientX, y: event.clientY };

        if (!moveu && Math.hypot(ultimo.x - inicio.x, ultimo.y - inicio.y) > LIMIAR_ARRASTE) {
            aoComecarAMover();
        }
    });

    box.addEventListener("pointerup", finalizarGesto);
    box.addEventListener("pointercancel", finalizarGesto);
}



