/**
 * Core Game Engine
 * Manages player states, turn phases, mana pools, card drawing, and fatigue.
 */

import { HEROES, getCardById, createStarterDeck, KEYWORDS } from './cards.js';

export class GameEngine {
  constructor(playerClass = 'MAGE', opponentClass = 'HUNTER', playerDeck = null, opponentDeck = null) {
    this.turn = 1;
    this.activePlayer = 'PLAYER'; // 'PLAYER' or 'OPPONENT'
    this.gameOver = false;
    this.winner = null;
    this.log = [];

    // Initialize Player State
    this.player = this.initPlayer('PLAYER', playerClass, playerDeck);

    // Initialize Opponent State
    this.opponent = this.initPlayer('OPPONENT', opponentClass, opponentDeck);

    // Initial mulligan draw
    this.startFirstTurn();
  }

  initPlayer(id, heroClass, deckCardIds) {
    const heroConfig = HEROES[heroClass] || HEROES.MAGE;
    const cardList = (deckCardIds && deckCardIds.length > 0) ? deckCardIds : createStarterDeck(heroClass);

    // Instantiate cards with unique IDs
    const deck = this.shuffle(cardList.map((cardId, index) => {
      const card = getCardById(cardId);
      return {
        ...card,
        instanceId: `${id}_card_${index}_${Math.random().toString(36).substr(2, 5)}`
      };
    }));

    return {
      id,
      name: id === 'PLAYER' ? 'Игрок' : 'Противник (ИИ)',
      heroClass,
      health: heroConfig.health,
      maxHealth: heroConfig.health,
      armor: 0,
      heroPower: { ...heroConfig.heroPower, usedThisTurn: false },
      mana: 0,
      maxMana: 0,
      fatigue: 0,
      deck,
      hand: [],
      board: [], // Max 7 minions
      maxBoardSize: 7
    };
  }

  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  addLog(msg) {
    this.log.push(`[Ход ${this.turn}] ${msg}`);
  }

  startFirstTurn() {
    // Player draws 3 cards
    for (let i = 0; i < 3; i++) {
      this.drawCard('PLAYER');
    }
    // Opponent draws 4 cards
    for (let i = 0; i < 4; i++) {
      this.drawCard('OPPONENT');
    }

    // Start Player Turn 1
    this.startTurn('PLAYER');
  }

  startTurn(playerId) {
    if (this.gameOver) return;

    this.activePlayer = playerId;
    const current = playerId === 'PLAYER' ? this.player : this.opponent;

    // Increase max mana up to 10
    if (current.maxMana < 10) {
      current.maxMana += 1;
    }
    current.mana = current.maxMana;
    current.heroPower.usedThisTurn = false;

    // Refresh minion attack availability
    current.board.forEach(minion => {
      minion.canAttack = true;
      minion.attacksThisTurn = 0;
    });

    this.addLog(`Начало хода: ${current.name}`);

    // Draw card at turn start
    this.drawCard(playerId);
  }

  endTurn() {
    if (this.gameOver) return;

    const previous = this.activePlayer;
    this.addLog(`Конец хода: ${previous === 'PLAYER' ? this.player.name : this.opponent.name}`);

    if (previous === 'OPPONENT') {
      this.turn += 1;
      this.startTurn('PLAYER');
    } else {
      this.startTurn('OPPONENT');
    }
  }

  drawCard(playerId) {
    const p = playerId === 'PLAYER' ? this.player : this.opponent;

    if (p.deck.length === 0) {
      p.fatigue += 1;
      this.addLog(`${p.name} не имеет карт в колоде! Урон от усталости: ${p.fatigue}`);
      this.damageCharacter(p, p.fatigue);
      return null;
    }

    const card = p.deck.pop();

    if (p.hand.length >= 10) {
      this.addLog(`Рука ${p.name} переполнена! Карта ${card.name} сгорает.`);
      return null;
    }

    p.hand.push(card);
    this.addLog(`${p.name} берет карту: ${card.name}`);
    return card;
  }

  damageCharacter(target, amount) {
    if (amount <= 0 || this.gameOver) return;

    // If target is Hero
    if (target.heroClass) {
      if (target.armor > 0) {
        if (target.armor >= amount) {
          target.armor -= amount;
          amount = 0;
        } else {
          amount -= target.armor;
          target.armor = 0;
        }
      }
      target.health -= amount;
      this.addLog(`${target.name} получает ${amount} урона. (Осталось ЗДР: ${target.health})`);

      if (target.health <= 0) {
        this.checkGameOver();
      }
      return;
    }

    // If target is Minion on board
    if (target.keywords && target.keywords.includes(KEYWORDS.DIVINE_SHIELD)) {
      target.keywords = target.keywords.filter(k => k !== KEYWORDS.DIVINE_SHIELD);
      this.addLog(`Божественный щит у ${target.name} поглотил урон!`);
      return;
    }

    target.health -= amount;
    this.addLog(`Существо ${target.name} получает ${amount} урона.`);

    this.cleanupDeadMinions();
  }

  healCharacter(target, amount) {
    if (amount <= 0) return;

    if (target.heroClass) {
      target.health = Math.min(target.maxHealth, target.health + amount);
      this.addLog(`${target.name} восстанавливает ${amount} ед. здоровья.`);
    } else if (target.health !== undefined) {
      target.health = Math.min(target.maxHealth || target.health, target.health + amount);
      this.addLog(`Существо ${target.name} восстанавливает ${amount} ед. здоровья.`);
    }
  }

  cleanupDeadMinions() {
    [this.player, this.opponent].forEach(p => {
      const deadMinions = p.board.filter(m => m.health <= 0);

      // Execute deathrattles
      deadMinions.forEach(minion => {
        if (minion.keywords && minion.keywords.includes(KEYWORDS.DEATHRATTLE)) {
          this.executeDeathrattle(p.id, minion);
        }
      });

      p.board = p.board.filter(m => m.health > 0);
    });

    this.checkGameOver();
  }

  executeDeathrattle(ownerId, minion) {
    this.addLog(`Срабатывает Предсмертный хрип существа ${minion.name}!`);
    if (minion.effect && minion.effect.type === 'DRAW_CARD') {
      this.drawCard(ownerId);
    }
  }

  checkGameOver() {
    if (this.player.health <= 0 && this.opponent.health <= 0) {
      this.gameOver = true;
      this.winner = 'DRAW';
      this.addLog('Ничья! Оба героя пали.');
    } else if (this.player.health <= 0) {
      this.gameOver = true;
      this.winner = 'OPPONENT';
      this.addLog('Победа противника!');
    } else if (this.opponent.health <= 0) {
      this.gameOver = true;
      this.winner = 'PLAYER';
      this.addLog('Победа игрока!');
    }
  }
}
