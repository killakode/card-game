/**
 * UI Deck Builder Component
 * Enables browsing collection, filtering by class/type, and assembling a 20-card custom deck.
 */

import { CARDS_DATABASE, getCardsByClass, getCardById } from '../engine/cards.js';

export class DeckBuilderView {
  constructor(container, heroClass, currentDeck, callbacks) {
    this.container = container;
    this.heroClass = heroClass;
    this.deck = currentDeck ? [...currentDeck] : [];
    this.maxDeckSize = 20;
    this.callbacks = callbacks; // { onSaveDeck, onBackToMenu }
  }

  render() {
    const availableCards = getCardsByClass(this.heroClass);

    this.container.innerHTML = `
      <div class="deck-builder-screen">
        <div class="deck-builder-header">
          <h2>Редактор Колоды (${this.heroClass})</h2>
          <div class="deck-count-badge">Карт в колоде: <span id="deck-card-count">${this.deck.length}</span> / ${this.maxDeckSize}</div>
          <div class="deck-builder-buttons">
            <button id="btn-save-deck" class="btn btn-primary">Сохранить</button>
            <button id="btn-back-menu" class="btn btn-secondary">В Главное Меню</button>
          </div>
        </div>

        <div class="deck-builder-content">
          <div class="collection-panel">
            <h3>Коллекция карт</h3>
            <div class="cards-grid">
              ${availableCards.map(card => this.renderCollectionCard(card)).join('')}
            </div>
          </div>

          <div class="deck-panel">
            <h3>Ваша Колода</h3>
            <div class="deck-list" id="deck-list-container">
              ${this.renderDeckList()}
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  renderCollectionCard(card) {
    const countInDeck = this.deck.filter(id => id === card.id).length;
    const isFull = countInDeck >= 2;

    return `
      <div class="card-item ${isFull ? 'card-disabled' : ''}" data-card-id="${card.id}">
        <div class="card-header">
          <span class="card-cost">${card.cost}</span>
          <span class="card-title">${card.name}</span>
        </div>
        <div class="card-icon">${card.icon || '🃏'}</div>
        <div class="card-desc">${card.description}</div>
        ${card.type === 'MINION' ? `
          <div class="card-stats">
            <span class="card-attack">⚔️ ${card.attack}</span>
            <span class="card-health">❤️ ${card.health}</span>
          </div>
        ` : '<div class="card-stats"><span class="card-type-spell">🔮 Заклинание</span></div>'}
        <div class="card-count-badge">В колоде: ${countInDeck}/2</div>
      </div>
    `;
  }

  renderDeckList() {
    if (this.deck.length === 0) {
      return '<div class="empty-deck-msg">Колода пуста. Нажмите на карту из коллекции, чтобы добавить ее.</div>';
    }

    // Group cards by id for list view
    const cardCounts = {};
    this.deck.forEach(id => {
      cardCounts[id] = (cardCounts[id] || 0) + 1;
    });

    return Object.keys(cardCounts).map(id => {
      const card = getCardById(id);
      const count = cardCounts[id];
      return `
        <div class="deck-list-item" data-card-id="${id}">
          <span class="item-cost">${card.cost}</span>
          <span class="item-name">${card.name}</span>
          <span class="item-count">x${count}</span>
          <button class="btn-remove-card" data-card-id="${id}">❌</button>
        </div>
      `;
    }).join('');
  }

  attachEvents() {
    // Add card click
    const collectionItems = this.container.querySelectorAll('.collection-panel .card-item');
    collectionItems.forEach(item => {
      item.addEventListener('click', () => {
        const cardId = item.getAttribute('data-card-id');
        this.addCardToDeck(cardId);
      });
    });

    // Remove card click
    const removeButtons = this.container.querySelectorAll('.btn-remove-card');
    removeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cardId = btn.getAttribute('data-card-id');
        this.removeCardFromDeck(cardId);
      });
    });

    // Save button
    const btnSave = this.container.querySelector('#btn-save-deck');
    if (btnSave) {
      btnSave.addEventListener('click', () => {
        if (this.deck.length !== this.maxDeckSize) {
          alert(`В колоде должно быть ровно ${this.maxDeckSize} карт! сейчас ${this.deck.length}`);
          return;
        }
        if (this.callbacks.onSaveDeck) {
          this.callbacks.onSaveDeck(this.deck);
        }
      });
    }

    // Back button
    const btnBack = this.container.querySelector('#btn-back-menu');
    if (btnBack) {
      btnBack.addEventListener('click', () => {
        if (this.callbacks.onBackToMenu) this.callbacks.onBackToMenu();
      });
    }
  }

  addCardToDeck(cardId) {
    if (this.deck.length >= this.maxDeckSize) return;

    const count = this.deck.filter(id => id === cardId).length;
    if (count >= 2) return;

    this.deck.push(cardId);
    this.render();
  }

  removeCardFromDeck(cardId) {
    const index = this.deck.indexOf(cardId);
    if (index !== -1) {
      this.deck.splice(index, 1);
      this.render();
    }
  }
}
