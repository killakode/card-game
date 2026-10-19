/**
 * UI Main Menu View
 */

import { HEROES } from '../engine/cards.js';

export class MenuView {
  constructor(container, callbacks) {
    this.container = container;
    this.callbacks = callbacks; // { onStartGame, onOpenDeckBuilder, onShowLeaderboard }
  }

  render(selectedHeroClass = 'MAGE') {
    this.container.innerHTML = `
      <div class="menu-screen">
        <div class="title-logo">
          <h1>КАРТОЧНЫЕ ЛЕГЕНДЫ</h1>
          <p class="subtitle">Карточная игра в стиле Hearthstone для Яндекс Игр</p>
        </div>

        <div class="class-selection">
          <h2>Выберите Героя:</h2>
          <div class="class-cards-container">
            ${Object.keys(HEROES).map(key => {
              const hero = HEROES[key];
              const isSelected = hero.heroClass === selectedHeroClass;
              return `
                <div class="class-card ${isSelected ? 'selected' : ''}" data-class="${hero.heroClass}">
                  <div class="hero-avatar ${hero.heroClass.toLowerCase()}"></div>
                  <h3>${hero.name}</h3>
                  <div class="hero-power-preview">
                    <strong>Сила героя:</strong> ${hero.heroPower.name} (${hero.heroPower.cost} маны)
                    <p>${hero.heroPower.description}</p>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="menu-actions">
          <button id="btn-start-game" class="btn btn-primary btn-large">⚔️ В БОЙ (Против ИИ)</button>
          <button id="btn-deck-builder" class="btn btn-secondary">🎴 Редактор Колоды</button>
          <button id="btn-ad-reward" class="btn btn-gold">🎁 Смотреть рекламу за +50 золота</button>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const classCards = this.container.querySelectorAll('.class-card');
    classCards.forEach(card => {
      card.addEventListener('click', () => {
        const selectedClass = card.getAttribute('data-class');
        if (this.callbacks.onSelectClass) {
          this.callbacks.onSelectClass(selectedClass);
        }
      });
    });

    const btnStart = this.container.querySelector('#btn-start-game');
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        if (this.callbacks.onStartGame) this.callbacks.onStartGame();
      });
    }

    const btnDeck = this.container.querySelector('#btn-deck-builder');
    if (btnDeck) {
      btnDeck.addEventListener('click', () => {
        if (this.callbacks.onOpenDeckBuilder) this.callbacks.onOpenDeckBuilder();
      });
    }

    const btnAd = this.container.querySelector('#btn-ad-reward');
    if (btnAd) {
      btnAd.addEventListener('click', () => {
        if (this.callbacks.onWatchAd) this.callbacks.onWatchAd();
      });
    }
  }
}
