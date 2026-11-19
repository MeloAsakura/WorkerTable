---
sessionId: session-261119-104342-14hp
---

# Erros Encontrados

### ✓ Done Step 1: Análise do Código do Pomodoro (`task-manager.js`)
### ✓ Done Step 2: Corrigir todos os 5 erros identificados

Foram encontrados **5 erros** no código do pomodoro:

---

#### ❌ ERRO 1: Variável `onde` não definida (linha 429)
**Local:** `alertaTerminado()` — linha 424-430

```js
function alertaTerminado() {
    const tarefa = document.getElementById('caixaDeTarefas')
    const alertaVisual = document.createElement('div')

    const diametro = Math.max(tarefa.clientWidth + tarefa.clientHeight)
    alertaVisual.style.width = onde.style.height = `${diametro}px`  // ← 'onde' não existe
}
```

**Problema:** A variável `onde` não está declarada em nenhum lugar, causando `ReferenceError`.

**Correção sugerida:** Substituir `onde` por `alertaVisual`:
```js
alertaVisual.style.width = `${diametro}px`
alertaVisual.style.height = `${diametro}px`
```

---

#### ❌ ERRO 2: Elemento `tarefa` não encontrado (linha 425)
**Local:** `alertaTerminado()` — linha 425

```js
const tarefa = document.getElementById('caixaDeTarefas')
```

**Problema:** O ID `caixaDeTarefas` pode não existir no HTML. Se `tarefa` for `null`, a linha 428 vai causar `TypeError` ao acessar `clientWidth`.

**Correção sugerida:** Verificar se o elemento existe antes de usar:
```js
if (!tarefa) return
```

---

#### ❌ ERRO 3: Dois listeners `keydown` duplicados (linhas 362-389)
**Local:** `inputTimer()` — linhas 362-389

```js
// Primeiro listener (linha 362)
divInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') completarValor()
})

// Segundo listener (linha 365)
divInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        // ... lógica para confirmar tempo
    }
    if (e.key === 'Escape') {
        divInput.replaceWith(timer)
    }
})
```

**Problema:** Há dois `addEventListener('keydown')` separados. O primeiro chama `completarValor()` que só formata o valor no input, mas não substitui o input pelo timer. O segundo listener faz a validação e substituição. Isso causa comportamento duplicado e confuso.

**Correção sugerida:** Unificar em um único listener `keydown`.

---

#### ❌ ERRO 4: `completarValor()` não substitui o input pelo timer (linha 347-359)
**Local:** `inputTimer()` — função `completarValor`

```js
function completarValor() {
    const digitos = divInput.value.replace(/\D/g, '')
    if (!digitos) {
        divInput.value = ''
        return
    }
    const minutos = parseInt(digitos.slice(0, 2), 10)
    const segundos = Math.min(parseInt(digitos.slice(2).padEnd(2, '0'), 10), 59)
    divInput.value = formatar(minutos * 60 + segundos)  // ← só formata, não substitui
}
```

**Problema:** A função formata o valor no input, mas nunca chama `divInput.replaceWith(timer)`. Quando o `blur` ocorre, o input permanece na tela sem voltar ao timer.

**Correção sugerida:** Adicionar a substituição no final de `completarValor()` ou remover o listener de `blur` e manter apenas o de `Enter`.

---

#### ❌ ERRO 5: `alertaTerminado()` nunca é chamada
**Local:** `iniciar()` — linha 399-417

**Problema:** A função `alertaTerminado()` é definida mas nunca é chamada quando o timer termina (linha 409-414). Apenas o botão muda para `Start`.

**Correção sugerida:** Chamar `alertaTerminado()` dentro do bloco `if (totalSegundos <= 0)`.

---

### Resumo dos Erros

| # | Erro | Linha | Severidade |
|---|------|-------|------------|
| 1 | Variável `onde` não definida | 429 | **Crítico** (quebra o código) |
| 2 | Elemento `tarefa` pode ser `null` | 425-428 | **Crítico** (quebra o código) |
| 3 | Dois listeners `keydown` duplicados | 362-389 | **Médio** (comportamento duplicado) |
| 4 | `completarValor()` não substitui input | 347-359 | **Médio** (input fica preso) |
| 5 | `alertaTerminado()` nunca chamada | 424-430 | **Baixo** (código morto) |