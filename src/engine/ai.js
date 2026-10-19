/**
 * AI Opponent Heuristic Decision Engine
 * Evaluates hand, board, mana, and lethal possibilities to play optimal turns.
 */

import { CARD_TYPES, KEYWORDS } from './cards.js';

export class AIController {
  constructor(gameEngine, combatController) {
    this.engine = gameEngine;
    this.combat = combatController;
    this.aiId = 'OPPONENT';
    this.playerId = 'PLAYER';
  }

  // Executes full AI turn sequence
  playTurn() {
    if (this.engine.gameOver || this.engine.activePlayer !== this.aiId) return;

    this.engine.addLog('ИИ обдумывает ход...');

    // 1. Check for Lethal on enemy hero first
    if (this.checkAndExecuteLethal()) {
      return;
    }

    // 2. Play playable minion cards from hand
    this.playMinionsFromHand();

    // 3. Play spell cards or removal
    this.playSpellsFromHand();

    // 4. Perform minion combat (trade favorably or attack enemy hero)
    this.executeMinionAttacks();

    // 5. Use Hero Power if mana permits
    this.useHeroPowerIfPossible();

    // 6. Play any remaining cards after combat
    this.playMinionsFromHand();

    // 7. End AI turn
    this.engine.endTurn();
  }

  get ai() {
    return this.engine.opponent;
  }

  get player() {
    return this.engine.player;
  }

  checkAndExecuteLethal() {
    const totalMinionAttack = this.ai.board
      .filter(m => m.canAttack && m.attacksThisTurn === 0)
      .reduce((sum, m) => sum + m.attack, 0);

    const tauntMinions = this.player.board.filter(m => m.keywords && m.keywords.includes(KEYWORDS.TAUNT));

    if (tauntMinions.length === 0 && totalMinionAttack >= this.player.health) {
      this.engine.addLog('ИИ видит возможность смертельного удара!');
      const readyMinions = this.ai.board.filter(m => m.canAttack && m.attacksThisTurn === 0);
      for (const minion of readyMinions) {
        this.combat.attack(this.aiId, minion.instanceId, this.playerId);
      }
      return true;
    }
    return false;
  }

  playMinionsFromHand() {
    let playedCard = true;
    while (playedCard && this.ai.mana > 0 && !this.engine.gameOver) {
      playedCard = false;
      const minionIndices = [];

      for (let i = 0; i < this.ai.hand.length; i++) {
        const card = this.ai.hand[i];
        if (card.type === CARD_TYPES.MINION && card.cost <= this.ai.mana) {
          minionIndices.push({ index: i, card });
        }
      }

      if (minionIndices.length === 0 || this.ai.board.length >= this.ai.maxBoardSize) {
        break;
      }

      // Sort by cost (highest first for mana efficiency)
      minionIndices.sort((a, b) => b.card.cost - a.card.cost);
      const chosen = minionIndices[0];

      // Determine target for Battlecry if needed
      let targetId = null;
      if (chosen.card.effect) {
        if (chosen.card.effect.type === 'DEAL_DAMAGE') {
          // Target player taunt minion or hero
          const taunt = this.player.board.find(m => m.keywords && m.keywords.includes(KEYWORDS.TAUNT));
          targetId = taunt ? taunt.instanceId : this.playerId;
        } else if (chosen.card.effect.type === 'BUFF_FRIENDLY_MINION' || chosen.card.effect.type === 'BUFF_AND_TAUNT') {
          if (this.ai.board.length > 0) {
            targetId = this.ai.board[0].instanceId;
          }
        }
      }

      const success = this.combat.playCard(this.aiId, chosen.index, targetId);
      if (success) {
        playedCard = true;
      }
    }
  }

  playSpellsFromHand() {
    let playedSpell = true;
    while (playedSpell && this.ai.mana > 0 && !this.engine.gameOver) {
      playedSpell = false;
      for (let i = 0; i < this.ai.hand.length; i++) {
        const card = this.ai.hand[i];
        if (card.type === CARD_TYPES.SPELL && card.cost <= this.ai.mana) {
          let targetId = null;
          if (card.effect && card.effect.target === 'ANY') {
            const taunt = this.player.board.find(m => m.keywords && m.keywords.includes(KEYWORDS.TAUNT));
            targetId = taunt ? taunt.instanceId : (this.player.board.length > 0 ? this.player.board[0].instanceId : this.playerId);
          } else if (card.effect && card.effect.type === 'DESTROY_DAMAGED_MINION') {
            const damaged = this.player.board.find(m => m.health < m.maxHealth);
            if (!damaged) continue;
            targetId = damaged.instanceId;
          }

          const success = this.combat.playCard(this.aiId, i, targetId);
          if (success) {
            playedSpell = true;
            break;
          }
        }
      }
    }
  }

  executeMinionAttacks() {
    let attackers = this.ai.board.filter(m => m.canAttack && m.attacksThisTurn === 0);

    for (const attacker of attackers) {
      if (this.engine.gameOver) break;

      // Check if player has Taunt minions
      const tauntMinions = this.player.board.filter(m => m.keywords && m.keywords.includes(KEYWORDS.TAUNT));

      if (tauntMinions.length > 0) {
        // Attack taunt minion
        const tauntTarget = tauntMinions[0];
        this.combat.attack(this.aiId, attacker.instanceId, tauntTarget.instanceId);
      } else {
        // Favorable trades vs enemy minions or attack hero directly
        const tradeTarget = this.player.board.find(m => m.attack >= 3 && attacker.attack >= m.health);
        if (tradeTarget) {
          this.combat.attack(this.aiId, attacker.instanceId, tradeTarget.instanceId);
        } else {
          // Attack player hero
          this.combat.attack(this.aiId, attacker.instanceId, this.playerId);
        }
      }
    }
  }

  useHeroPowerIfPossible() {
    if (this.ai.mana >= this.ai.heroPower.cost && !this.ai.heroPower.usedThisTurn) {
      const hp = this.ai.heroPower;
      if (hp.type === 'TARGETED_DAMAGE') {
        const taunt = this.player.board.find(m => m.keywords && m.keywords.includes(KEYWORDS.TAUNT));
        const targetId = taunt ? taunt.instanceId : this.playerId;
        this.combat.useHeroPower(this.aiId, targetId);
      } else {
        this.combat.useHeroPower(this.aiId);
      }
    }
  }
}
