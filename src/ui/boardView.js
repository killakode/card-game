/**
 * Interactive Game Board UI View
 * Render hand, board, mana crystals, hero stats, combat targeting arrows, animations, tooltips, and game log.
 */

import { KEYWORDS } from '../engine/cards.js';
import { soundManager } from '../audio/soundManager.js';

export class BoardView {
  constructor(container, gameEngine, combatController, aiController, callbacks) {
    this.container = container;
    this.game = gameEngine;
    this.combat = combatController;
    this.ai = aiController;
    this.callbacks = callbacks; // { onGameEnd, onBackToMenu }

    this.selectedHandCard = null; // { index, card }
    this.selectedAttacker = null; // minion instanceId
  }

  render() {
    this.container.innerHTML = `
      <div class="game-board-container" id="board-container">
        <!-- TOP: OPPONENT HERO & HAND -->
        <div class="opponent-section">
          <div class="opponent-hand" id="opponent-hand">
            ${this.renderOpponentHand()}
          </div>
          <div class="hero-area opponent-hero-area" data-target-id="OPPONENT">
            <div class="hero-portrait opponent-portrait">
              <span class="hero-name">${this.game.opponent.name}</span>
              <div class="hero-stats">
                <span class="hero-health">❤️ ${this.game.opponent.health}</span>
                ${this.game.opponent.armor > 0 ? `<span class="hero-armor">🛡️ ${this.game.opponent.armor}</span>` : ''}
              </div>
            </div>
            <div class="hero-power-btn has-tooltip" id="opp-hero-power">
              ${this.game.opponent.heroPower.name} (${this.game.opponent.heroPower.cost})
              <div class="tooltip-box">
                <header>${this.game.opponent.heroPower.name}</header>
                <p>${this.game.opponent.heroPower.description}</p>
              </div>
            </div>
            <div class="mana-container">
              Мана: ${this.game.opponent.mana}/${this.game.opponent.maxMana}
            </div>
          </div>
        </div>

        <!-- MIDDLE: GAME BOARD (OPPONENT BOARD & PLAYER BOARD) -->
        <div class="board-field">
          <div class="board-row opponent-board" id="opponent-board">
            ${this.renderBoardMinions(this.game.opponent.board, 'OPPONENT')}
          </div>
          <div class="board-divider">
            <button id="btn-end-turn" class="btn btn-turn ${this.game.activePlayer === 'PLAYER' ? 'active-turn' : ''}">
              ${this.game.activePlayer === 'PLAYER' ? 'ЗАВЕРШИТЬ ХОД' : 'ХОД ИИ...'}
            </button>
          </div>
          <div class="board-row player-board" id="player-board">
            ${this.renderBoardMinions(this.game.player.board, 'PLAYER')}
          </div>
        </div>

        <!-- BOTTOM: PLAYER HERO & HAND -->
        <div class="player-section">
          <div class="hero-area player-hero-area" data-target-id="PLAYER">
            <div class="hero-portrait player-portrait">
              <span class="hero-name">${this.game.player.name}</span>
              <div class="hero-stats">
                <span class="hero-health">❤️ ${this.game.player.health}</span>
                ${this.game.player.armor > 0 ? `<span class="hero-armor">🛡️ ${this.game.player.armor}</span>` : ''}
              </div>
            </div>
            <button class="hero-power-btn has-tooltip ${this.game.player.heroPower.usedThisTurn || this.game.player.mana < this.game.player.heroPower.cost ? 'disabled' : ''}" id="btn-player-hero-power">
              ⚡ ${this.game.player.heroPower.name} (${this.game.player.heroPower.cost})
              <div class="tooltip-box">
                <header>${this.game.player.heroPower.name} (${this.game.player.heroPower.cost} маны)</header>
                <p>${this.game.player.heroPower.description}</p>
              </div>
            </button>
            <div class="mana-container">
              Мана: ${this.renderManaCrystals(this.game.player.mana, this.game.player.maxMana)}
            </div>
          </div>

          <div class="player-hand" id="player-hand">
            ${this.renderPlayerHand()}
          </div>
        </div>

        <!-- GAME LOG & OVERLAY -->
        <div class="game-log-panel" id="game-log">
          <h4>Журнал боя</h4>
          <div class="log-entries">
            ${this.game.log.slice(-6).map(msg => `<div class="log-msg">${msg}</div>`).join('')}
          </div>
        </div>

        ${this.game.gameOver ? this.renderGameOverModal() : ''}
      </div>
    `;

    this.attachEvents();
  }

  renderOpponentHand() {
    return this.game.opponent.hand.map(() => `
      <div class="card-back">🎴</div>
    `).join('');
  }

  renderPlayerHand() {
    return this.game.player.hand.map((card, index) => {
      const isPlayable = this.game.activePlayer === 'PLAYER' && card.cost <= this.game.player.mana;
      const isSelected = this.selectedHandCard && this.selectedHandCard.index === index;

      return `
        <div class="card-in-hand has-tooltip ${isPlayable ? 'playable' : ''} ${isSelected ? 'selected' : ''}" data-hand-index="${index}">
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

          <div class="tooltip-box">
            <header>${card.name}</header>
            <p>${card.description}</p>
            ${card.keywords && card.keywords.length > 0 ? `<p><em>Ключевые слова: ${card.keywords.join(', ')}</em></p>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  renderBoardMinions(board, owner) {
    if (board.length === 0) {
      return `<div class="empty-board-msg">${owner === 'PLAYER' ? 'Нажмите на карту в руке, чтобы разыграть существо' : 'Поле противника пусто'}</div>`;
    }

    return board.map(minion => {
      const isTaunt = minion.keywords && minion.keywords.includes(KEYWORDS.TAUNT);
      const isDivineShield = minion.keywords && minion.keywords.includes(KEYWORDS.DIVINE_SHIELD);
      const canAttack = owner === 'PLAYER' && this.game.activePlayer === 'PLAYER' && minion.canAttack && minion.attacksThisTurn === 0;
      const isAttacker = this.selectedAttacker === minion.instanceId;

      return `
        <div class="board-minion has-tooltip ${isTaunt ? 'taunt' : ''} ${isDivineShield ? 'divine-shield' : ''} ${canAttack ? 'can-attack' : ''} ${isAttacker ? 'selected-attacker' : ''}"
             data-instance-id="${minion.instanceId}" data-owner="${owner}">
          <div class="minion-icon">${minion.icon || '👾'}</div>
          <div class="minion-name">${minion.name}</div>
          <div class="minion-stats">
            <span class="minion-attack">⚔️ ${minion.attack}</span>
            <span class="minion-health">❤️ ${minion.health}</span>
          </div>

          <div class="tooltip-box">
            <header>${minion.name}</header>
            <p>Здоровье: ${minion.health}/${minion.maxHealth || minion.health}</p>
            <p>Атака: ${minion.attack}</p>
            ${minion.keywords && minion.keywords.length > 0 ? `<p><strong>Свойства: ${minion.keywords.join(', ')}</strong></p>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  renderManaCrystals(current, max) {
    let crystals = '';
    for (let i = 0; i < max; i++) {
      crystals += i < current ? '💎' : '⚪';
    }
    return `${current}/${max} ${crystals}`;
  }

  renderGameOverModal() {
    const isPlayerWinner = this.game.winner === 'PLAYER';
    const title = isPlayerWinner ? '🎉 ПОБЕДА!' : (this.game.winner === 'DRAW' ? '🤝 НИЧЬЯ!' : '💀 ПОРАЖЕНИЕ');

    if (isPlayerWinner) soundManager.playVictory();
    else soundManager.playDefeat();

    return `
      <div class="modal-overlay">
        <div class="modal-content ${isPlayerWinner ? 'victory' : 'defeat'}">
          <h2>${title}</h2>
          <p>${isPlayerWinner ? 'Вы великолепно одолели соперника!' : 'Не унывайте, соберите лучшую колоду и попробуйте снова!'}</p>
          <div class="modal-actions">
            <button id="btn-restart-game" class="btn btn-primary">Играть Снова</button>
            <button id="btn-exit-menu" class="btn btn-secondary">В Главное Меню</button>
          </div>
        </div>
      </div>
    `;
  }

  triggerAttackAnimation(attackerEl, targetEl, animationType = 'SLASH') {
    if (!attackerEl || !targetEl) return;

    const attackerRect = attackerEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    if (animationType === 'ARROW') {
      const arrow = document.createElement('div');
      arrow.className = 'anim-projectile';
      arrow.innerText = '🏹';
      arrow.style.left = `${attackerRect.left + attackerRect.width / 2}px`;
      arrow.style.top = `${attackerRect.top + attackerRect.height / 2}px`;
      document.body.appendChild(arrow);

      setTimeout(() => {
        arrow.style.left = `${targetRect.left + targetRect.width / 2}px`;
        arrow.style.top = `${targetRect.top + targetRect.height / 2}px`;
      }, 50);

      setTimeout(() => arrow.remove(), 400);
    } else if (animationType === 'RAMMING') {
      attackerEl.classList.add('anim-ramming');
      setTimeout(() => attackerEl.classList.remove('anim-ramming'), 400);
    } else {
      const slash = document.createElement('div');
      slash.className = 'anim-slash';
      slash.innerText = '⚔️';
      slash.style.left = `${targetRect.left + targetRect.width / 4}px`;
      slash.style.top = `${targetRect.top + targetRect.height / 4}px`;
      document.body.appendChild(slash);

      setTimeout(() => slash.remove(), 450);
    }
  }

  attachEvents() {
    // End Turn Button
    const btnEndTurn = this.container.querySelector('#btn-end-turn');
    if (btnEndTurn && this.game.activePlayer === 'PLAYER') {
      btnEndTurn.addEventListener('click', () => {
        this.selectedHandCard = null;
        this.selectedAttacker = null;
        this.game.endTurn();
        this.render();

        // Trigger AI Turn with short delay
        setTimeout(() => {
          if (this.game.activePlayer === 'OPPONENT' && !this.game.gameOver) {
            this.ai.playTurn();
            this.render();
          }
        }, 600);
      });
    }

    // Play card from hand
    const handCards = this.container.querySelectorAll('#player-hand .card-in-hand');
    handCards.forEach(cardEl => {
      cardEl.addEventListener('click', () => {
        const handIndex = parseInt(cardEl.getAttribute('data-hand-index'), 10);
        const card = this.game.player.hand[handIndex];

        if (this.game.activePlayer !== 'PLAYER') return;

        // If card needs target (e.g. targeted spell or battlecry)
        if (card.effect && (card.effect.target === 'ANY' || card.effect.type === 'BUFF_FRIENDLY_MINION' || card.effect.type === 'BUFF_AND_TAUNT' || card.effect.type === 'DESTROY_DAMAGED_MINION')) {
          if (this.selectedHandCard && this.selectedHandCard.index === handIndex) {
            this.selectedHandCard = null;
          } else {
            this.selectedHandCard = { index: handIndex, card };
            this.selectedAttacker = null;
          }
          this.render();
        } else {
          // Play card immediately without target
          const success = this.combat.playCard('PLAYER', handIndex);
          if (success) {
            soundManager.playCardPlay();
            this.selectedHandCard = null;
            this.render();
          }
        }
      });
    });

    // Select Attacker Minion or Target for Card / Attack / Hero Power
    const allTargets = this.container.querySelectorAll('[data-instance-id], [data-target-id]');
    allTargets.forEach(targetEl => {
      targetEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const instanceId = targetEl.getAttribute('data-instance-id');
        const targetHeroId = targetEl.getAttribute('data-target-id');
        const targetId = instanceId || targetHeroId;

        if (this.game.activePlayer !== 'PLAYER') return;

        // Case 1: Resolving targeted hand card
        if (this.selectedHandCard) {
          const success = this.combat.playCard('PLAYER', this.selectedHandCard.index, targetId);
          if (success) {
            soundManager.playSpell();
            this.selectedHandCard = null;
            this.render();
          }
          return;
        }

        // Case 2: Selecting / Executing Minion Attack
        if (instanceId && targetEl.getAttribute('data-owner') === 'PLAYER') {
          const minion = this.game.player.board.find(m => m.instanceId === instanceId);
          if (minion && minion.canAttack && minion.attacksThisTurn === 0) {
            this.selectedAttacker = (this.selectedAttacker === instanceId) ? null : instanceId;
            this.render();
            return;
          }
        }

        // Case 3: Executing attack on opponent target
        if (this.selectedAttacker && targetId) {
          const attackerMinion = this.game.player.board.find(m => m.instanceId === this.selectedAttacker);
          const attackerEl = this.container.querySelector(`[data-instance-id="${this.selectedAttacker}"]`);

          let animType = 'SLASH';
          if (attackerMinion && (attackerMinion.id.includes('archer') || attackerMinion.id.includes('rifleman'))) {
            animType = 'ARROW';
          } else if (attackerMinion && (attackerMinion.id.includes('boar') || attackerMinion.id.includes('wolfrider'))) {
            animType = 'RAMMING';
          }

          this.triggerAttackAnimation(attackerEl, targetEl, animType);

          setTimeout(() => {
            const success = this.combat.attack('PLAYER', this.selectedAttacker, targetId);
            if (success) {
              soundManager.playAttack();
              this.selectedAttacker = null;
              this.render();
            }
          }, 200);
        }
      });
    });

    // Hero Power Button
    const btnHeroPower = this.container.querySelector('#btn-player-hero-power');
    if (btnHeroPower) {
      btnHeroPower.addEventListener('click', () => {
        if (this.game.player.heroPower.type === 'TARGETED_DAMAGE') {
          alert('Выберите цель на поле боя для силы героя!');
        } else {
          const success = this.combat.useHeroPower('PLAYER');
          if (success) {
            soundManager.playSpell();
            this.render();
          }
        }
      });
    }

    // Modal buttons
    const btnRestart = this.container.querySelector('#btn-restart-game');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => {
        if (this.callbacks.onRestartGame) this.callbacks.onRestartGame();
      });
    }

    const btnExit = this.container.querySelector('#btn-exit-menu');
    if (btnExit) {
      btnExit.addEventListener('click', () => {
        if (this.callbacks.onBackToMenu) this.callbacks.onBackToMenu();
      });
    }
  }
}
