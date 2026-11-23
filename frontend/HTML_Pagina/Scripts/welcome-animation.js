
const time = 45;
const textoH1 ='Bem-vindo ao WorkTable'

const textoP1 ='Organize suas ideias, crie caixas de tarefas e acompanhe seus projetos em um só lugar.'
const textoP2='Defina prioridades, estabeleça prazos e delegue tarefas à sua equipe para trabalhar de forma mais eficiente.'
const textoP3='Organize. Colabore. Realize.'
const h1= document.getElementById('texto-digitado')
const p1 = document.getElementById('paragrafo1')
const p2 = document.getElementById('paragrafo2')
const p3 = document.getElementById('paragrafo3')

const cursor = document.createElement('span')
cursor.className='cursor'

cursor.addEventListener('animationend',()=>{
    cursor.classList.add('hidden')
})

function textoBoasVindas(elemento,texto){
    return new Promise( end=>{
        let indice = 0
        // Correção: usar insertBefore para mover o cursor sem duplicá-lo
        // (appendChild movia o cursor global entre elementos, causando comportamento estranho)
        elemento.appendChild(cursor)
        function escrever(){
            if(indice<texto.length){
                cursor.before(texto.charAt(indice))
                indice++
                setTimeout(escrever,time)
            }else{
                end()
            }
        }

        escrever()
    })
}

async function start() {
    await textoBoasVindas(h1, textoH1)
    await textoBoasVindas(p1, textoP1)
    await textoBoasVindas(p2, textoP2)
    await textoBoasVindas(p3, textoP3)
    cursor.classList.add('sair')
}
start()
