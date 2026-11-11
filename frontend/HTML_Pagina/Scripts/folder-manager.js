const areaTables = document.getElementById('areaDeTables');
const templateBoxTransparente = document.getElementById('boxTransparente');

let pastas = new Map;
let contPastas = 0

let idBox = 0

areaTables.addEventListener('click', () => {
    const clone = templateBoxTransparente.content.firstElementChild.cloneNode(true);

    ladoDir.appendChild(clone);
    configurarArrasto(clone);

    clone.addEventListener('click', (event) => {
        if (event.target.closest(
            '.miniaturasPasta, .miniaturaPasta, .armazenamentoPasta'
        )) return;

        clone.classList.toggle('aberta');
    });

    pastas.set(clone.id = contPastas++,clone)
});


function pastaSobreposta(box) {
    const rect = box.getBoundingClientRect();

    for(const [id,pasta] of pastas){
        const limite = pasta.getBoundingClientRect();

        const sobreP =
            rect.left < limite.right &&
            rect.right > limite.left &&
            rect.top < limite.bottom &&
            rect.bottom > limite.top;

        if(sobreP){
            return pasta
        }
    }
    return null;
}



document.addEventListener('pointerup', (e) => {
    const box = e.target.closest('.newBoxTable');

    if (!box) return;
    if (box.closest('.armazenamentoPasta')) return;

    if (!box.dataset.id) {
        box.dataset.id = String(++idBox);
    }

    const pasta = pastaSobreposta(box);
    if (!pasta) return;

    const armazenamento = pasta.querySelector('.armazenamentoPasta');
    if (!armazenamento) return;

    armazenamento.appendChild(box);

    styleMiniatura(box, pasta);
});


function styleMiniatura(box, pasta) {
    const containerMiniaturas = pasta.querySelector('.miniaturasPasta');

    if (!containerMiniaturas) return;
    const existente = containerMiniaturas.querySelector(
        `[data-box-id="${box.dataset.id}"]`
    );

    if (existente) return;

    const botoesMiniatura = document.createElement('div')
    botoesMiniatura.classList.add('botoesMiniatura')

    const miniatura = document.createElement('button')
    miniatura.type = 'button';
    miniatura.classList.add('miniaturaPasta');
    miniatura.dataset.boxId = box.dataset.id;

    const titulo = box.querySelector(
        '.inputDoTituloNovaBox, .inputDoTituloDaBox'
    );
    miniatura.textContent =
        '📋 ' + (titulo?.value.trim() || 'Box guardada');


    const botaoremoverminiatura = document.createElement('button')
    botaoremoverminiatura.type = 'button'
    botaoremoverminiatura.classList.add('botaoRemoverMiniatura')
    botaoremoverminiatura.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
    botaoremoverminiatura.addEventListener('click', (e) => {
        e.stopPropagation();
        box.classList.remove('expandida');
        box.remove();
        botoesMiniatura.remove();
    });

    const descolarPasta = document.createElement('button')
    descolarPasta.type='button'
    descolarPasta.classList.add('buttonDescolarPasta')
    descolarPasta.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M19 3l-7 7"/><path d="M8 18H4v-6"/><path d="M4 18l7-7"/></svg>'
    descolarPasta.addEventListener('click',(e)=>{
        e.stopPropagation()

        const arm = box.closest('.armazenamentoPasta')
        if(!arm) return

        box.classList.remove('expandida')

        box.style.left = '';
        box.style.top = '';

        ladoDir.appendChild(box)
        botoesMiniatura.remove();
    })


    botoesMiniatura.append(miniatura, botaoremoverminiatura,descolarPasta)
    containerMiniaturas.appendChild(botoesMiniatura);
}


function miniaturaClicada() {
    document.addEventListener('click', (e) => {
        const miniatura = e.target.closest('.miniaturaPasta');

        if (!miniatura) return;

        let pastaEncontrada = null;
        for(const [idPasta , pasta] of pastas){
            if(pasta.contains(miniatura)){
                pastaEncontrada=pasta;
                break;
            }
        }
        if (!pastaEncontrada) return;

        const idClicado = miniatura.dataset.boxId;

        pastaEncontrada.querySelectorAll('.armazenamentoPasta .newBoxTable')
            .forEach((box) => {
                const mesma = box.dataset.id === idClicado;
                const jaExpandida = box.classList.contains('expandida');
                box.classList.toggle(
                    'expandida',
                    mesma && !jaExpandida
                );
            });
    });
}

miniaturaClicada();


function configurarArrastoExpandida(box) {
    let arrasto = null;

    box.addEventListener('pointerdown', (event) => {
        if (!box.classList.contains('expandida')) return;
        if (event.button !== 0) return;
        if (event.target.closest('input, textarea, button, select, a')) {
            return;
        }

        const pasta = box.closest('.SandBox');
        if (!pasta) return;

        const rectPasta = pasta.getBoundingClientRect();
        const rectBox = box.getBoundingClientRect();

        arrasto = {
            xInicial: event.clientX,
            yInicial: event.clientY,

            esquerdaInicial:
                rectBox.left - rectPasta.left - pasta.clientLeft,

            topoInicial:
                rectBox.top - rectPasta.top - pasta.clientTop,

            pointerId: event.pointerId
        };
        box.style.left = `${arrasto.esquerdaInicial}px`;
        box.style.top = `${arrasto.topoInicial}px`;

        event.stopPropagation();
        event.preventDefault();

        box.setPointerCapture(event.pointerId);
    });

    box.addEventListener('pointermove', (event) => {
        if (!arrasto) return;
        if (event.pointerId !== arrasto.pointerId) return;

        const deslocamentoX = event.clientX - arrasto.xInicial;
        const deslocamentoY = event.clientY - arrasto.yInicial;

        box.style.left =
            `${arrasto.esquerdaInicial + deslocamentoX}px`;

        box.style.top =
            `${arrasto.topoInicial + deslocamentoY}px`;
    });

    function pararArrasto(event) {
        if (!arrasto) return;
        if (event.pointerId !== arrasto.pointerId) return;

        arrasto = null;
    }

    box.addEventListener('pointerup', pararArrasto);
    box.addEventListener('pointercancel', pararArrasto);
}

function removerForButtonBox() {
    document.addEventListener('click', (e) => {
        const botao = e.target.closest('.buttonRemoverNewBox');
        if (!botao) return;

        const box = botao.closest('.newBoxTable');
        if (!box || !box.dataset.id) return;

        const miniatura = document.querySelector(
            `[data-box-id="${box.dataset.id}"]`
        );
        if (!miniatura) return;

        (miniatura.closest('.botoesMiniatura, .estiloMiniaturaPasta') || miniatura).remove();
    }, true);
}

removerForButtonBox()


function redimensionarBoxExpandida(box) {
    let redimensionamento = false;
    let direcao = null;

    const margem = 10;
    const larguraMinima = 180;
    const alturaMinima = 120;

    let posicaoX = 0;
    let posicaoY = 0;

    let larguraInicial = 0;
    let alturaInicial = 0;

    let esquerdaInicial = 0;
    let topoInicial = 0;


    function identificarBorda(e) {
        const rect = box.getBoundingClientRect();

        const esquerda = e.clientX <= rect.left + margem;
        const direita = e.clientX >= rect.right - margem;

        const superior = e.clientY <= rect.top + margem;
        const inferior = e.clientY >= rect.bottom - margem;

        if (superior && esquerda) return 'nw';
        if (superior && direita) return 'ne';

        if (inferior && esquerda) return 'sw';
        if (inferior && direita) return 'se';

        if (superior) return 'n';
        if (inferior) return 's';

        if (esquerda) return 'w';
        if (direita) return 'e';

        return null;
    }

    box.addEventListener('pointerdown', (e) => {
        if (!box.classList.contains('expandida')) return;
        if (e.button !== 0) return;

        const borda = identificarBorda(e);

        if (!borda) return;

        const rect = box.getBoundingClientRect();

        const pasta = box.closest('.SandBox');
        if (!pasta) return;

        const rectPasta = pasta.getBoundingClientRect();

        direcao = borda;

        posicaoX = e.clientX;
        posicaoY = e.clientY;

        larguraInicial = rect.width;
        alturaInicial = rect.height;

        esquerdaInicial =
            rect.left - rectPasta.left - pasta.clientLeft + pasta.scrollLeft;

        topoInicial =
            rect.top - rectPasta.top - pasta.clientTop + pasta.scrollTop;


        box.style.left = `${esquerdaInicial}px`;
        box.style.top = `${topoInicial}px`;

        redimensionamento = true;

        box.setPointerCapture(e.pointerId);

        e.stopPropagation();
        e.preventDefault();
    });


    box.addEventListener('pointermove', (e) => {

        if (!redimensionamento) {
            const borda = identificarBorda(e);

            const cursores = {
                nw: 'nwse-resize',
                se: 'nwse-resize',
                ne: 'nesw-resize',
                sw: 'nesw-resize',
                n: 'ns-resize',
                s: 'ns-resize',
                e: 'ew-resize',
                w: 'ew-resize'
            };

            box.style.cursor = cursores[borda] || 'default';

            return;
        }

        e.stopPropagation();

        const diferencaX = e.clientX - posicaoX;
        const diferencaY = e.clientY - posicaoY;

        let novaLargura = larguraInicial;
        let novaAltura = alturaInicial;

        let novaEsquerda = esquerdaInicial;
        let novoTopo = topoInicial;

        // Redimensionamento horizontal.
        if (direcao.includes('e')) {
            novaLargura = Math.max(
                larguraMinima,
                larguraInicial + diferencaX
            );
        }

        if (direcao.includes('w')) {
            novaLargura = Math.max(
                larguraMinima,
                larguraInicial - diferencaX
            );

            novaEsquerda =
                esquerdaInicial + (larguraInicial - novaLargura);
        }

        if (direcao.includes('s')) {
            novaAltura = Math.max(
                alturaMinima,
                alturaInicial + diferencaY
            );
        }

        if (direcao.includes('n')) {
            novaAltura = Math.max(
                alturaMinima,
                alturaInicial - diferencaY
            );

            novoTopo =
                topoInicial + (alturaInicial - novaAltura);
        }

        box.style.width = `${novaLargura}px`;
        box.style.height = `${novaAltura}px`;

        box.style.left = `${novaEsquerda}px`;
        box.style.top = `${novoTopo}px`;
    });


    function finalizarRedimensionamento() {
        redimensionamento = false;
        direcao = null;
    }

    box.addEventListener('pointerup', finalizarRedimensionamento);
    box.addEventListener('pointercancel', finalizarRedimensionamento);
}

const blocos = [];
const MARGEM_SUPERIOR = 15;
const dist_botaoBloco = 60;

function configurarGestoSuperior(box) {
    let ativo = false;
    let guia = null;
    let ultimoClientY = 0;

    function iniciar() {
        ativo = true;

        guia = document.createElement('div');
        guia.classList.add('guiaPontilhada');

        box.classList.add('comGuia');
        box.append(guia);
    }

    function fixar() {
        if (!ativo) return;
        ativo = false;
        guia?.classList.add('fixa');
    }

    function cancelar() {
        ativo = false;

        guia?.remove();
        guia = null;

        box.classList.remove('comGuia');

        const btn = box.querySelector('.btnCriarBlocoDeAnotacoes');
        btn?.remove();

        const bloco = box.querySelector('.blocoDeAnotacoes');

        if (bloco) {
            const i = blocos.indexOf(bloco);

            if (i !== -1) {
                blocos.splice(i, 1);
            }

            bloco.closest('.divBloco')?.remove();
        }
    }

    function atualizarGuia() {
        if (!ativo || !guia) return;

        const rect = box.getBoundingClientRect();
        const y = Math.min(Math.max(ultimoClientY - rect.top, 0), rect.height);

        guia.style.height = `${y}px`;
        guia.classList.toggle('completa', y >= rect.height / 2);

        if (y >= dist_botaoBloco) anotacoesLivres(box)
    }

    box.addEventListener('dblclick', (e) => {
        if (e.target.closest('input, button')) return;

        pulsoDbClick(e.clientX, e.clientY);

        const y = e.clientY - box.getBoundingClientRect().top;
        if (y > MARGEM_SUPERIOR) return;

        cancelar();
        iniciar();
    });

    box.addEventListener('pointermove', (e) => {
        if (!ativo) return;
        ultimoClientY = e.clientY;
        atualizarGuia();
    });

    box.addEventListener('pointerdown', fixar);
    box.addEventListener('pointerleave', fixar);

    document.addEventListener('keydown', (e) => {
        const box = e.target.closest('.newBoxTable')
        if(!box)return

        if (e.key === 'Escape' || e.key === 'Delete') {
           cancelar();
        }
    });

    return atualizarGuia;
}

const anotacoes = new Map;
function anotacoesLivres(box) {
    const id = box.idBox;
    if (!box.classList.contains('comGuia')) return

    const existente = box.querySelector('.blocoDeAnotacoes');
    const btnExistente = box.querySelector('.btnCriarBlocoDeAnotacoes');

    if (existente || btnExistente) return;

    function textArea() {
        const divBloco = document.createElement('div')
        divBloco.classList.add('divBloco')

        const bloco = document.createElement('textarea')
        bloco.classList.add('blocoDeAnotacoes');

        bloco.value = anotacoes.get(id) ?? '';
        bloco.addEventListener('input', () => {
            anotacoes.set(id, bloco.value);
        });

        divBloco.append(bloco)
        box.append(divBloco)
        blocos.push(bloco)
    }

    if (anotacoes.has(id)) {
        textArea()
        return
    }

    const btn = btnCriacaoBlocos(box)
    btn.addEventListener('click', () => {
        textArea()

        btn.remove()
    })
}


function btnCriacaoBlocos(box) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.classList.add('btnCriarBlocoDeAnotacoes');
    btn.setAttribute('aria-label', 'Criar bloco de anotações');
    btn.title = 'Criar bloco de anotações';
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                            fill="none" stroke="currentColor" stroke-width="1.8"
                            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="13" height="13" rx="3"/>
        <path d="M6.5 7.5h6"/>
        <rect x="6.5" y="10" width="6" height="3" rx="1.5"/>
        <path d="M18.5 15.5v6M15.5 18.5h6"/></svg>`;
    box.append(btn);

    return btn;
}


function observarBox(box) {
    if (!box) return;

    const attGuia = configurarGestoSuperior(box);

    const observer = new ResizeObserver(() => {
        anotacoesLivres(box);
        attGuia();

        const divText = box.querySelector('.blocoDeAnotacoes');
        if (!divText) return;

        divText.style.width = `${rect.width}px`
        divText.style.height = `${rect.height}px`

    });
    observer.observe(box);
}

function pulsoDbClick(x, y) {
    const pulso = document.createElement('div');
    pulso.classList.add('pulso');
    pulso.style.left = `${x}px`;
    pulso.style.top = `${y}px`;

    document.body.appendChild(pulso);
    pulso.addEventListener('animationend', () => pulso.remove());
}

