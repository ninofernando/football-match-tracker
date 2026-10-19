# football-match-tracker
Real-time football match tracker

# Jogo de 60 minutos

Web app para telemóvel para registar um jogo de futebol entre amigos: 10 jogadores, 2 equipas, 60 minutos.

## Funcionalidades

- Nome e equipa (A ou B) de cada jogador, e nome das equipas editável
- Cronómetro de 00:00 a 60:00 que arranca ao começar e **nunca pausa**
- Duas colunas no ecrã de jogo: Equipa A à esquerda, Equipa B à direita
- Botões de golo (bola) e assistência (chuteira) por jogador, com contador
- Resultado em tempo real
- Botão **Refazer**: lista os registos com o minuto, permite apagar qualquer um, anular o último ou começar um novo jogo. Fecha sozinho após 8 segundos sem uso
- Tudo guardado em `localStorage`, por isso nada se perde ao recarregar ou fechar o separador

## Estrutura

```
index.html   página
style.css    estilos
script.js    lógica da app
icons/       football-line.svg (golo) e shoe-cleats.svg (assistência)
```

## Como usar

1. Abre `index.html` no navegador, ou publica a pasta no GitHub Pages / Netlify / Vercel.
2. No telemóvel, usa sempre o mesmo aparelho e navegador durante o jogo (o `localStorage` é local a cada aparelho).
3. Preenche os jogadores e carrega em **Começar o jogo**. O tempo começa logo.

## Personalizar

- Duração do jogo: constante `DUR` no início de `script.js` (em milissegundos).
- Tempo até o painel Refazer fechar: o `8000` na função `armLog` em `script.js`.
- Cores: variáveis CSS em `:root` no `style.css`.
- Ícones: substitui os ficheiros em `icons/` por outros SVG com o mesmo nome.
- Fonte: Outfit, carregada do Google Fonts (precisa de internet; há fonte de reserva).

## Dados guardados

Chave `jogo60-v1` no `localStorage`. Para apagar tudo manualmente: DevTools > Application > Local Storage, ou `localStorage.removeItem('jogo60-v1')` na consola.