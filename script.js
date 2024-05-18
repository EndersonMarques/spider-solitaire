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
}

class Deck {
  constructor() {
    this.cards = []
    this.init()
  }

  init() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades']
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]

    for (let suit of suits){
      for (let value of values){
        this.cards.push(new Card(suit, value))
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

  addCard(card){
    this.cards.push(card)
  }

  removeCard() {
    return this.cards.pop()
  }

  topCard() {
    return this.cards[this.cards.length - 1];
  }
}

class Game {
  constructor() {
      this.deck = new Deck();
      this.columns = [];
      this.draggedCard = null; // Carta sendo arrastada
      this.initColumns();
  }

  initColumns() {
      for (let i = 0; i < 10; i++) {
          this.columns.push(new Column());
      }
  }

  start() {
    for (let i = 0; i < 52; i++) {
        let columnIndex = i % 10;
        let card = this.deck.cards.pop();
        this.columns[columnIndex].addCard(card);
    }
    // Virar a última carta de cada coluna
    this.columns.forEach(column => {
        let topCard = column.topCard();
        if (topCard) topCard.flip();
    });
    this.render();
  }

  handleDragStart(card, cardDiv) {
    this.draggedCard = card;
    cardDiv.classList.add('dragging');
  }

  handleDrop(columnIndex) {
    if (this.draggedCard) {
      const targetColumn = this.columns[columnIndex];
      // Adicione lógica de validação de movimento aqui
      targetColumn.addCard(this.draggedCard);
      this.render();
    }
  }

  handleDragEnd(cardDiv) {
    cardDiv.classList.remove('dragging');
    this.draggedCard = null;
    this.render();
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
          cardDiv.style.top = `${cardIndex * 20}px`; // Ajuste o valor conforme necessário para o empilhamento
          
          cardDiv.addEventListener('dragstart', (event) => {
            this.handleDragStart(card, cardDiv);
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
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("Spider Solitaire Inicializado")
  const game = new Game();
  game.start();
})
