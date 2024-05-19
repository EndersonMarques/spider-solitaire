class Card {
  constructor(suit, value) {
    this.suit = suit;
    this.value = value;
    this.faceUp = false;
    this.element = null; // Armazenar a referência ao elemento DOM
  }

  flip() {
    this.faceUp = !this.faceUp;
  }

  getImage() {
    if (this.faceUp) {
      return `images/${this.value}_of_${this.suit}.png`;
    } else {
      return 'images/back.png';
    }
  }

  isSameSuit(card) {
    return this.suit === card.suit;
  }

  isNextInSequence(card) {
    return this.value === card.value + 1;
  }
}

class Deck {
  constructor() {
    this.cards = [];
    this.init();
  }

  init() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

    for (let i = 0; i < 2; i++) { // Criar dois baralhos
      for (let suit of suits) {
        for (let value of values) {
          this.cards.push(new Card(suit, value));
        }
      }
    }

    this.shuffle();
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }
}

class Column {
  constructor() {
    this.cards = [];
  }

  addCard(card) {
    this.cards.push(card);
  }

  addCards(cards) {
    this.cards = this.cards.concat(cards);
  }

  removeCard() {
    return this.cards.pop();
  }

  removeCards(startIndex) {
    return this.cards.splice(startIndex);
  }

  topCard() {
    return this.cards[this.cards.length - 1];
  }

  canMoveCard(card) {
    const topCard = this.topCard();
    if (!topCard) {
      return true;
    }
    return topCard.isSameSuit(card) && topCard.isNextInSequence(card);
  }

  getSequenceStartingFrom(card) {
    const cardIndex = this.cards.indexOf(card);
    if (cardIndex === -1) return [];

    return this.cards.slice(cardIndex);
  }
}

class Game {
  constructor() {
    this.deck = new Deck();
    this.columns = [];
    this.stock = []; // Estoque de cartas
    this.draggedCard = null; // Carta sendo arrastada
    this.draggedCards = []; // Sequência de cartas sendo arrastadas
    this.sourceColumn = null; // Coluna de origem da carta arrastada
    this.initColumns();
  }

  initColumns() {
    for (let i = 0; i < 10; i++) {
      this.columns.push(new Column());
    }
  }

  start() {
    for (let i = 0; i < 54; i++) { // Distribuir cartas iniciais
      let columnIndex = i % 10;
      let card = this.deck.cards.pop();
      this.columns[columnIndex].addCard(card);
    }
    // Virar a última carta de cada coluna
    this.columns.forEach(column => {
      let topCard = column.topCard();
      if (topCard) topCard.flip();
    });
    // Adicionar o restante das cartas ao estoque
    this.stock = this.deck.cards;
    this.render();
  }

  dealFromStock() {
    if (this.stock.length < 10) return; // Não há cartas suficientes no estoque

    this.columns.forEach(column => {
      let card = this.stock.pop();
      column.addCard(card);
      card.flip(); // Virar a nova carta distribuída
    });
    this.render();
  }

  handleDragStart(card, cardDiv, columnIndex) {
    this.draggedCard = card;
    this.sourceColumn = columnIndex;
    this.draggedCards = this.columns[columnIndex].getSequenceStartingFrom(card);
    cardDiv.classList.add('dragging');
  }

  handleDragEnd(cardDiv) {
    cardDiv.classList.remove('dragging');
    this.draggedCard = null;
    this.draggedCards = [];
    this.sourceColumn = null;
    this.render();
  }

  handleDrop(columnIndex) {
    if (this.draggedCard && this.sourceColumn !== null) {
      const targetColumn = this.columns[columnIndex];
      const sourceColumn = this.columns[this.sourceColumn];

      // Validação de movimento
      if (targetColumn.canMoveCard(this.draggedCard)) {
        targetColumn.addCards(this.draggedCards);
        sourceColumn.removeCards(sourceColumn.cards.indexOf(this.draggedCard));
        let topCard = sourceColumn.topCard();
        if (topCard) topCard.flip(); // Vira a última carta da coluna anterior
      }

      this.draggedCard = null;
      this.draggedCards = [];
      this.sourceColumn = null;
      this.render();
    }
  }

  render() {
    const gameContainer = document.getElementById('game-container');
    gameContainer.innerHTML = '';

    this.columns.forEach((column, columnIndex) => {
      const columnDiv = document.createElement('div');
      columnDiv.className = 'column';
      column.cards.forEach((card, cardIndex) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.style.backgroundImage = `url(${card?.getImage()})`;
        cardDiv.style.top = `${cardIndex * 20}px`;
        cardDiv.draggable = true;
        card.element = cardDiv;

        cardDiv.addEventListener('dragstart', (event) => {
          this.handleDragStart(card, cardDiv, columnIndex);
        });

        cardDiv.addEventListener('dragend', () => {
          this.handleDragEnd(cardDiv);
        });

        columnDiv.appendChild(cardDiv);
      });

      columnDiv.addEventListener('dragover', (event) => {
        event.preventDefault();
      });

      columnDiv.addEventListener('drop', () => {
        this.handleDrop(columnIndex);
      });

      gameContainer.appendChild(columnDiv);
    });

    // Renderizar o botão para distribuir cartas do estoque
    const stockButton = document.getElementById('deal-from-stock');
    stockButton.disabled = this.stock.length < 10;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("Spider Solitaire Inicializado");
  const game = new Game();
  game.start();

  // Adicionar evento ao botão de distribuir cartas do estoque
  document.getElementById('deal-from-stock').addEventListener('click', () => {
    game.dealFromStock();
  });
});
