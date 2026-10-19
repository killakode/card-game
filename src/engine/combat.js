/**
 * Combat Rules, Target Validation, Spell Processing & Keyword Resolution
 */

import { CARD_TYPES, KEYWORDS } from './cards.js';

export class CombatController {
  constructor(gameEngine) {
    this.engine = gameEngine;
  }

  // Play a card from player hand
  playCard(playerId, handIndex, targetId = null) {
    const current = playerId === 'PLAYER' ? this.engine.player : this.engine.opponent;
    const enemy = playerId === 'PLAYER' ? this.engine.opponent : this.engine.player;

    if (this.engine.activePlayer !== playerId) {
      console.warn('Не ваш ход!');
      return false;
    }

    if (handIndex < 0 || handIndex >= current.hand.length) {
      return false;
    }

    const card = current.hand[handIndex];

    if (current.mana < card.cost) {
      this.engine.addLog(`Недостаточно маны для розыгрыша ${card.name}! (Нужно: ${card.cost}, Есть: ${current.mana})`);
      return false;
    }

    if (card.type === CARD_TYPES.MINION) {
      if (current.board.length >= current.maxBoardSize) {
        this.engine.addLog(`Игровое поле заполнено! Нельзя призвать больше 7 существ.`);
        return false;
      }

      // Deduct mana
      current.mana -= card.cost;
      // Remove from hand
      current.hand.splice(handIndex, 1);

      // Create board minion object
      const minion = {
        ...card,
        maxHealth: card.health,
        canAttack: card.keywords && card.keywords.includes(KEYWORDS.CHARGE),
        attacksThisTurn: 0
      };

      current.board.push(minion);
      this.engine.addLog(`${current.name} призывает существо ${minion.name} (${minion.attack}/${minion.health})`);

      // Resolve Battlecry if any
      if (minion.keywords && minion.keywords.includes(KEYWORDS.BATTLECRY)) {
        this.resolveBattlecry(playerId, minion, targetId);
      }

      return true;
    } else if (card.type === CARD_TYPES.SPELL) {
      // Validate targeted spell requirement
      if (card.effect && card.effect.target === 'ANY' && !targetId) {
        this.engine.addLog(`Заклинание ${card.name} требует выбор цели!`);
        return false;
      }

      // Deduct mana
      current.mana -= card.cost;
      // Remove from hand
      current.hand.splice(handIndex, 1);

      this.engine.addLog(`${current.name} разыгрывает заклинание: ${card.name}`);
      this.resolveSpell(playerId, card, targetId);
      return true;
    }

    return false;
  }

  // Resolve Minion Battlecry
  resolveBattlecry(playerId, minion, targetId) {
    const current = playerId === 'PLAYER' ? this.engine.player : this.engine.opponent;
    const enemy = playerId === 'PLAYER' ? this.engine.opponent : this.engine.player;

    if (!minion.effect) return;

    const effect = minion.effect;

    switch (effect.type) {
      case 'DEAL_DAMAGE':
        const target = this.findTargetById(targetId);
        if (target) {
          this.engine.addLog(`Божественный клич ${minion.name}: наносит ${effect.value} ед. урона.`);
          this.engine.damageCharacter(target, effect.value);
        }
        break;

      case 'DRAW_CARD':
        this.engine.drawCard(playerId);
        break;

      case 'BUFF_FRIENDLY_MINION':
        const friendlyMinion = current.board.find(m => m.instanceId === targetId && m.instanceId !== minion.instanceId);
        if (friendlyMinion) {
          friendlyMinion.attack += effect.attack;
          friendlyMinion.health += effect.health;
          friendlyMinion.maxHealth += effect.health;
          this.engine.addLog(`${minion.name} дает +${effect.attack}/+${effect.health} существу ${friendlyMinion.name}`);
        }
        break;

      case 'BUFF_ALL_OTHER_MINIONS':
        current.board.forEach(m => {
          if (m.instanceId !== minion.instanceId) {
            m.attack += effect.attack;
            m.health += effect.health;
            m.maxHealth += effect.health;
          }
        });
        this.engine.addLog(`${minion.name} усиливает всех остальных союзников!`);
        break;

      case 'HEAL_ALL_FRIENDLIES':
        this.engine.healCharacter(current, effect.value);
        current.board.forEach(m => this.engine.healCharacter(m, effect.value));
        break;

      case 'BUFF_AND_TAUNT':
        const beastTarget = current.board.find(m => m.instanceId === targetId);
        if (beastTarget) {
          beastTarget.attack += effect.attack;
          beastTarget.health += effect.health;
          beastTarget.maxHealth += effect.health;
          if (!beastTarget.keywords.includes(KEYWORDS.TAUNT)) {
            beastTarget.keywords.push(KEYWORDS.TAUNT);
          }
          this.engine.addLog(`${minion.name} усиливает ${beastTarget.name} и дает Провокацию.`);
        }
        break;
    }
  }

  // Resolve Spell Card Effects
  resolveSpell(playerId, card, targetId) {
    const current = playerId === 'PLAYER' ? this.engine.player : this.engine.opponent;
    const enemy = playerId === 'PLAYER' ? this.engine.opponent : this.engine.player;

    if (!card.effect) return;
    const effect = card.effect;

    switch (effect.type) {
      case 'DEAL_DAMAGE': {
        const target = this.findTargetById(targetId);
        if (target) {
          this.engine.damageCharacter(target, effect.value);
        }
        break;
      }

      case 'DRAW_CARD': {
        for (let i = 0; i < effect.value; i++) {
          this.engine.drawCard(playerId);
        }
        break;
      }

      case 'RANDOM_DAMAGE': {
        // Deal N damage randomly distributed among enemy targets (Hero + Minions)
        for (let i = 0; i < effect.value; i++) {
          const targets = [enemy, ...enemy.board.filter(m => m.health > 0)];
          if (targets.length === 0 || enemy.health <= 0) break;
          const randomTarget = targets[Math.floor(Math.random() * targets.length)];
          this.engine.damageCharacter(randomTarget, 1);
        }
        break;
      }

      case 'AOE_DAMAGE_ENEMY_MINIONS': {
        const enemyMinions = [...enemy.board];
        enemyMinions.forEach(m => this.engine.damageCharacter(m, effect.value));
        break;
      }

      case 'AOE_DAMAGE_ALL_MINIONS': {
        const allMinions = [...current.board, ...enemy.board];
        allMinions.forEach(m => this.engine.damageCharacter(m, effect.value));
        break;
      }

      case 'DESTROY_DAMAGED_MINION': {
        const damagedMinion = enemy.board.find(m => m.instanceId === targetId && m.health < m.maxHealth);
        if (damagedMinion) {
          damagedMinion.health = 0;
          this.engine.addLog(`Казнь уничтожает раненое существо ${damagedMinion.name}!`);
          this.engine.cleanupDeadMinions();
        }
        break;
      }

      case 'ARMOR_AND_DRAW': {
        current.armor += effect.armor;
        this.engine.addLog(`${current.name} получает ${effect.armor} ед. брони.`);
        for (let i = 0; i < effect.draw; i++) {
          this.engine.drawCard(playerId);
        }
        break;
      }

      case 'BRAWL': {
        const allBoard = [...current.board, ...enemy.board];
        if (allBoard.length > 1) {
          const survivor = allBoard[Math.floor(Math.random() * allBoard.length)];
          this.engine.addLog(`Потасовка! Единственный выживший: ${survivor.name}`);
          allBoard.forEach(m => {
            if (m.instanceId !== survivor.instanceId) {
              m.health = 0;
            }
          });
          this.engine.cleanupDeadMinions();
        }
        break;
      }

      case 'SUMMON_ANIMAL_COMPANION': {
        if (current.board.length < current.maxBoardSize) {
          const companions = [
            { id: 'h_huffer', name: 'Хаммер (Боров)', attack: 4, health: 2, maxHealth: 2, keywords: [KEYWORDS.CHARGE], icon: '🐗' },
            { id: 'h_misha', name: 'Миша (Медведь)', attack: 4, health: 4, maxHealth: 4, keywords: [KEYWORDS.TAUNT], icon: '🐻' }
          ];
          const companion = companions[Math.floor(Math.random() * companions.length)];
          companion.instanceId = `${playerId}_companion_${Math.random().toString(36).substr(2, 5)}`;
          companion.canAttack = companion.keywords.includes(KEYWORDS.CHARGE);
          companion.attacksThisTurn = 0;
          current.board.push(companion);
          this.engine.addLog(`Призван питомец: ${companion.name}`);
        }
        break;
      }

      case 'MULTI_SHOT': {
        const enemyMinions = [...enemy.board];
        if (enemyMinions.length > 0) {
          this.shuffleArray(enemyMinions);
          const targets = enemyMinions.slice(0, effect.count);
          targets.forEach(m => this.engine.damageCharacter(m, effect.value));
        }
        break;
      }
    }
  }

  // Use Hero Power
  useHeroPower(playerId, targetId = null) {
    const current = playerId === 'PLAYER' ? this.engine.player : this.engine.opponent;
    const enemy = playerId === 'PLAYER' ? this.engine.opponent : this.engine.player;

    if (this.engine.activePlayer !== playerId) return false;
    if (current.heroPower.usedThisTurn) {
      this.engine.addLog('Сила героя уже была использована на этом ходу!');
      return false;
    }
    if (current.mana < current.heroPower.cost) {
      this.engine.addLog('Недостаточно маны для использования силы героя!');
      return false;
    }

    const hp = current.heroPower;

    if (hp.type === 'TARGETED_DAMAGE') {
      const target = this.findTargetById(targetId);
      if (!target) {
        this.engine.addLog('Выберите цель для силы героя!');
        return false;
      }
      current.mana -= hp.cost;
      hp.usedThisTurn = true;
      this.engine.addLog(`${current.name} использует силу героя "${hp.name}"!`);
      this.engine.damageCharacter(target, hp.value);
      return true;
    } else if (hp.type === 'ARMOR_UP') {
      current.mana -= hp.cost;
      hp.usedThisTurn = true;
      current.armor += hp.value;
      this.engine.addLog(`${current.name} использует "${hp.name}" и получает ${hp.value} брони.`);
      return true;
    } else if (hp.type === 'HERO_DAMAGE') {
      current.mana -= hp.cost;
      hp.usedThisTurn = true;
      this.engine.addLog(`${current.name} использует "${hp.name}" против героя противника!`);
      this.engine.damageCharacter(enemy, hp.value);
      return true;
    }

    return false;
  }

  // Minion Attack Mechanic
  attack(playerId, attackerInstanceId, targetInstanceId) {
    if (this.engine.activePlayer !== playerId) return false;

    const attackerPlayer = playerId === 'PLAYER' ? this.engine.player : this.engine.opponent;
    const defenderPlayer = playerId === 'PLAYER' ? this.engine.opponent : this.engine.player;

    const attacker = attackerPlayer.board.find(m => m.instanceId === attackerInstanceId);
    if (!attacker) return false;

    if (!attacker.canAttack || attacker.attacksThisTurn >= 1) {
      this.engine.addLog(`Существо ${attacker.name} не может атаковать на этом ходу!`);
      return false;
    }

    // Taunt Rule Enforcement
    const tauntMinions = defenderPlayer.board.filter(m => m.keywords && m.keywords.includes(KEYWORDS.TAUNT));

    let defender = null;
    if (targetInstanceId === defenderPlayer.id) {
      // Attacking defender Hero
      if (tauntMinions.length > 0) {
        this.engine.addLog(`Ошибка: Сначала вы должны уничтожить существ с Провокацией!`);
        return false;
      }
      defender = defenderPlayer;
    } else {
      defender = defenderPlayer.board.find(m => m.instanceId === targetInstanceId);
      if (!defender) return false;

      if (tauntMinions.length > 0 && (!defender.keywords || !defender.keywords.includes(KEYWORDS.TAUNT))) {
        this.engine.addLog(`Ошибка: Сначала вы должны атаковать существо с Провокацией!`);
        return false;
      }
    }

    // Process combat execution
    attacker.attacksThisTurn += 1;
    attacker.canAttack = false;

    if (defender === defenderPlayer) {
      this.engine.addLog(`${attacker.name} (атака ${attacker.attack}) атакует героя ${defender.name}!`);
      this.engine.damageCharacter(defender, attacker.attack);
    } else {
      this.engine.addLog(`${attacker.name} (${attacker.attack}/${attacker.health}) атакует ${defender.name} (${defender.attack}/${defender.health})!`);
      // Reciprocal Combat Damage
      const attackerDamage = attacker.attack;
      const defenderDamage = defender.attack;

      this.engine.damageCharacter(defender, attackerDamage);
      this.engine.damageCharacter(attacker, defenderDamage);
    }

    return true;
  }

  findTargetById(id) {
    if (!id) return null;
    if (id === 'PLAYER') return this.engine.player;
    if (id === 'OPPONENT') return this.engine.opponent;

    const pMinion = this.engine.player.board.find(m => m.instanceId === id);
    if (pMinion) return pMinion;

    const oMinion = this.engine.opponent.board.find(m => m.instanceId === id);
    if (oMinion) return oMinion;

    return null;
  }

  shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
}
