// Definindo as cores como constantes
const AMARELO = "#FFDD20";
const LARANJA = "#F27830";
const ROSA_ESCURO = "#C25CA0";
const ROXO = "#554E9A";
const MARROM = "#8E5C4E";
const ROSA_CLARO = "#F261A9";
const AZUL = "#1E8ACB";
const VERMELHO = "#E41F25";
const ROXO_CLARO = "#914B8E";
const VERDE = "#00A068";
const PRETO = "#363636";
const ROXO_ESCURO = "#554D9B";
const ROSA_MEDIO = "#CC367F";

// Arrays de cores para os círculos e quadrados
let circleFills = [
  // Linha 1
  AMARELO, LARANJA, AMARELO, ROSA_ESCURO, AMARELO,
  // Linha 2
  ROXO, MARROM, LARANJA, AZUL, MARROM,
  // Linha 3
  ROSA_CLARO, AMARELO, ROSA_CLARO, LARANJA, AMARELO,
  // Linha 4
  AZUL, VERMELHO, AZUL, MARROM, LARANJA,
  // Linha 5
  MARROM, VERMELHO, VERMELHO, AZUL, VERMELHO
];

// Cores dos quadrados (bordas)
let squareFills = [
  // Linha 1
  MARROM, ROXO_CLARO, VERMELHO, MARROM, VERDE,
  // Linha 2
  LARANJA, LARANJA, AMARELO, VERDE, LARANJA,
  // Linha 3
  VERMELHO, AZUL, MARROM, AMARELO, MARROM,
  // Linha 4
  LARANJA, LARANJA, PRETO, LARANJA, VERDE,
  // Linha 5
  LARANJA, VERDE, ROXO_ESCURO, ROSA_MEDIO, ROXO_CLARO
];

// Variáveis para o jogo
let adjustedCellSize; // Tamanho ajustado para cada célula
let gameState = "START"; // Estados: START, SHOWING_SEQUENCE, PLAYER_TURN, GAME_OVER
let sequence = []; // Sequência que o jogador deve memorizar
let playerSequence = []; // Sequência que o jogador está tentando reproduzir
let currentIndex = 0; // Índice atual na exibição da sequência
let highlightedCell = -1; // Célula atualmente destacada
let highlightStartTime = 0; // Tempo de início do destaque
let highlightDuration = 600; // Duração do destaque em milissegundos
let delayBetweenHighlights = 200; // Tempo entre destaques consecutivos
let level = 1; // Nível atual do jogo
let startTime; // Tempo de início do jogo
let bestScore = 0; // Melhor pontuação
let gameStarted = false; // Flag para controlar se o jogo começou
let lastInteractionTime = 0; // Tempo da última interação
let wrongCell = -1; // Célula errada selecionada
let wrongCellTime = 0; // Tempo quando a célula errada foi selecionada

// Variáveis para efeitos sonoros
let successSound;
let failSound;
let clickSound;
let sequenceSound;

// Função preload do p5.js para carregar ativos antes de iniciar
function preload() {
}

// Função setup do p5.js - executada uma vez quando o programa inicia
function setup() {
  createCanvas(400, 500); // Altura aumentada para acomodar o placar
  textAlign(CENTER, CENTER); // Alinha texto ao centro
  textFont('Arial'); // Define a fonte
  
  // Inicializar as variáveis do jogo
  resetGame();
}

// Função para reiniciar as variáveis do jogo
function resetGame() {
  sequence = [];
  playerSequence = [];
  currentIndex = 0;
  highlightedCell = -1;
  level = 1;
  gameState = "START";
  gameStarted = false;
  lastInteractionTime = millis();
  wrongCell = -1;
}

// Função draw do p5.js - loop contínuo para renderização
function draw() {
  background(240); // Fundo cinza claro
  
  // Define o espaçamento entre os quadrados
  const spacing = 3.31;
  
  // Calcula o tamanho ajustado para cada célula
  adjustedCellSize = (width - spacing * 4) / 5;
  
  // Define o espaço entre a borda do quadrado e o círculo
  const circleMargin = 0.66;
  
  // Desenha os quadrados e círculos da grade
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const index = row * 5 + col;
      
      // Calcula a posição incluindo o espaçamento
      const x = col * (adjustedCellSize + spacing);
      const y = row * (adjustedCellSize + spacing);
      
      // Desenha o quadrado
      noStroke();
      
      let squareColor = color(squareFills[index]);
      
      // Aplica efeitos visuais com base no estado do jogo
      if (index === highlightedCell) {
        // Faz o quadrado brilhar quando destacado
        squareColor = lerpColor(color(squareFills[index]), color(255, 255, 255), 0.7);
      } else if (index === wrongCell && millis() - wrongCellTime < 500) {
        // Destaca célula errada em vermelho pulsante
        let pulseAmount = map(sin(millis() * 0.02), -1, 1, 0.3, 0.8);
        squareColor = lerpColor(color(squareFills[index]), color(255, 0, 0), pulseAmount);
      }
      
      fill(squareColor);
      rect(x, y, adjustedCellSize, adjustedCellSize);
      
      // Desenha o círculo
      let circleColor = color(circleFills[index]);
      
      // Aplica efeitos visuais ao círculo também
      if (index === highlightedCell) {
        circleColor = lerpColor(color(circleFills[index]), color(255, 255, 255), 0.3);
      } else if (index === wrongCell && millis() - wrongCellTime < 500) {
        let pulseAmount = map(sin(millis() * 0.02), -1, 1, 0.3, 0.8);
        circleColor = lerpColor(color(circleFills[index]), color(255, 0, 0), pulseAmount);
      }
      
      fill(circleColor);
      
      // Calcula o diâmetro do círculo
      const circleDiameter = adjustedCellSize - (circleMargin * 2);
      
      // Posiciona o círculo no centro do quadrado
      const circleX = x + adjustedCellSize / 2;
      const circleY = y + adjustedCellSize / 2;
      
      ellipse(circleX, circleY, circleDiameter, circleDiameter);
    }
  }
  
  // Desenha interface do jogo conforme o estado atual
  fill(50);
  const scoreY = 400 + 20;
  
  switch (gameState) {
    case "START":
      textSize(24);
      fill(30);
      text("JOGO DE MEMÓRIA", width/2, scoreY);
      
      textSize(16);
      fill(80);
      text("Memorize a sequência e repita-a", width/2, scoreY + 30);
      
      textSize(18);
      fill(20);
      text("Clique para iniciar", width/2, scoreY + 60);
      
      break;
      
    case "SHOWING_SEQUENCE":
      textSize(24);
      fill(30);
      text("NÍVEL " + level, width/2, scoreY);
      
      textSize(16);
      fill(80);
      text("Observe a sequência...", width/2, scoreY + 30);
      
      // Verificar se é hora de destacar o próximo elemento da sequência
      let nowTime = millis();
      
      if (highlightedCell === -1) {
        // Iniciar destaque da próxima célula
        if (nowTime - lastInteractionTime > delayBetweenHighlights) {
          if (currentIndex < sequence.length) {
            highlightedCell = sequence[currentIndex];
            highlightStartTime = nowTime;
            currentIndex++;
            // Reproduzir som (se disponível)
            /* if (sequenceSound) {
              sequenceSound.play();
            } */
            lastInteractionTime = nowTime;
          } else {
            // Terminou de mostrar a sequência
            gameState = "PLAYER_TURN";
            playerSequence = [];
            currentIndex = 0;
            lastInteractionTime = nowTime;
          }
        }
      } else {
        // Verificar se o tempo de destaque acabou
        if (nowTime - highlightStartTime > highlightDuration) {
          highlightedCell = -1;
          lastInteractionTime = nowTime;
        }
      }
      break;
      
    case "PLAYER_TURN":
      textSize(24);
      fill(30);
      text("NÍVEL " + level, width/2, scoreY);
      
      textSize(16);
      fill(80);
      text("Sua vez! Repita a sequência", width/2, scoreY + 30);
      
      // Mostrar progresso da sequência
      textSize(16);
      fill(0, 100, 200);
      text(playerSequence.length + " / " + sequence.length, width/2, scoreY + 55);
      break;
      
    case "GAME_OVER":
      textSize(26);
      fill(200, 0, 0);
      text("FIM DE JOGO", width/2, scoreY);
      
      textSize(18);
      fill(30);
      text("Nível alcançado: " + level, width/2, scoreY + 30);
      
      if (level > bestScore) {
        bestScore = level;
        textSize(16);
        fill(0, 150, 0);
        text("Novo recorde!", width/2, scoreY + 50);
      } else {
        textSize(16);
        fill(80);
        text("Recorde: " + bestScore, width/2, scoreY + 50);
      }
      
      // Efeito pulsante no texto "Clique para jogar novamente"
      textSize(16 + sin(millis() * 0.004) * 2);
      fill(0, 100, 200);
      text("Clique para jogar novamente", width/2, scoreY + 75);
      break;
  }
  
  // Limpar marcação de célula errada após 500ms
  if (wrongCell !== -1 && millis() - wrongCellTime > 500) {
    wrongCell = -1;
  }
}

// Função mousePressed do p5.js - chamada quando o botão do mouse é pressionado
function mousePressed() {
  // Verificar se o clique foi na área de jogo ou na interface
  if (mouseY > 400) {
    // Clique na área de pontuação/interface
    handleGameStateClicks();
    return;
  }
  
  // Ignorar cliques na grade se não for a vez do jogador
  if (gameState !== "PLAYER_TURN") {
    handleGameStateClicks();
    return;
  }
  
  const spacing = 3.31;
  
  // Verificar em qual quadrado foi clicado
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const index = row * 5 + col;
      
      // Calcula a posição incluindo o espaçamento
      const x = col * (adjustedCellSize + spacing);
      const y = row * (adjustedCellSize + spacing);
      
      // Verifica se o clique foi dentro deste quadrado
      if (
        mouseX >= x && 
        mouseX <= x + adjustedCellSize && 
        mouseY >= y && 
        mouseY <= y + adjustedCellSize
      ) {
        // Reproduzir som de clique (se disponível)
        /* if (clickSound) {
          clickSound.play();
        } */
        
        // Destacar brevemente a célula clicada usando o sistema de timing do p5.js
        highlightedCell = index;
        highlightStartTime = millis();
        setTimeout(() => {
          highlightedCell = -1;
        }, 300);
        
        // Verificar se o clique está correto
        playerSequence.push(index);
        
        if (index !== sequence[currentIndex]) {
          // Jogador errou a sequência
          wrongCell = index;
          wrongCellTime = millis();
          
          /* if (failSound) {
            failSound.play();
          } */
          
          setTimeout(() => {
            gameState = "GAME_OVER";
          }, 500);
          
          return;
        } else {
          // Jogador acertou este elemento da sequência
          currentIndex++;
          
          // Verificar se completou a sequência
          if (currentIndex >= sequence.length) {
            // Sequência completa - avançar para o próximo nível
        
            level++;
            setTimeout(() => {
              // Avançar para o próximo nível
              addToSequence();
              gameState = "SHOWING_SEQUENCE";
              currentIndex = 0;
              playerSequence = [];
              lastInteractionTime = millis();
            }, 1000);
          }
        }
        
        return;
      }
    }
  }
}

// Gerencia cliques baseados no estado atual do jogo
function handleGameStateClicks() {
  switch (gameState) {
    case "START":
      // Iniciar o jogo
      gameStarted = true;
      startTime = millis();
      addToSequence();
      gameState = "SHOWING_SEQUENCE";
      break;
      
    case "GAME_OVER":
      // Reiniciar o jogo
      resetGame();
      break;
  }
}

// Adiciona um novo elemento à sequência
function addToSequence() {
  // Adiciona um elemento aleatório à sequência, evitando repetições consecutivas
  let newElement;
  do {
    newElement = floor(random(25));
  } while (sequence.length > 0 && newElement === sequence[sequence.length - 1]);
  
  sequence.push(newElement);
  
  // Ajusta a dificuldade com base no nível atual
  highlightDuration = max(600 - (level * 20), 300); // Diminui com o aumento do nível, mínimo 300ms
  delayBetweenHighlights = max(200 - (level * 5), 100); // Diminui com o aumento do nível, mínimo 100ms
}