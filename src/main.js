/**
 * Main Application Entry Point
 * Wires Yandex SDK, Game Engine, Combat Rules, AI Opponent, Sound, and UI Views.
 */

import { yaGames } from './yagames.js';
import { GameEngine } from './engine/gameEngine.js';
import { CombatController } from './engine/combat.js';
import { AIController } from './engine/ai.js';
import { MenuView } from './ui/menu.js';
import { DeckBuilderView } from './ui/deckBuilder.js';
import { BoardView } from './ui/boardView.js';
import { createStarterDeck } from './engine/cards.js';

class Application {
  constructor() {
    this.appContainer = document.getElementById('app');
    this.selectedHeroClass = 'MAGE';
    this.playerDecks = {
      MAGE: createStarterDeck('MAGE'),
      WARRIOR: createStarterDeck('WARRIOR'),
      HUNTER: createStarterDeck('HUNTER')
    };
    this.gold = 100;

    this.currentView = 'MENU'; // 'MENU', 'DECK_BUILDER', 'GAME'
  }

  async start() {
    await yaGames.init();

    // Load saved data if present
    const saveData = await yaGames.loadData();
    if (saveData) {
      if (saveData.playerDecks) this.playerDecks = saveData.playerDecks;
      if (saveData.gold !== undefined) this.gold = saveData.gold;
    }

    this.showMenu();
  }

  showMenu() {
    this.currentView = 'MENU';
    const menuView = new MenuView(this.appContainer, {
      onSelectClass: (heroClass) => {
        this.selectedHeroClass = heroClass;
        this.showMenu();
      },
      onStartGame: () => {
        this.startGame();
      },
      onOpenDeckBuilder: () => {
        this.showDeckBuilder();
      },
      onWatchAd: () => {
        yaGames.showRewardedVideo(
          () => {
            this.gold += 50;
            yaGames.saveData({ playerDecks: this.playerDecks, gold: this.gold });
            alert('Спасибо за просмотр! Вам начислено +50 золота.');
            this.showMenu();
          },
          () => {}
        );
      }
    });

    menuView.render(this.selectedHeroClass);
  }

  showDeckBuilder() {
    this.currentView = 'DECK_BUILDER';
    const deckBuilder = new DeckBuilderView(
      this.appContainer,
      this.selectedHeroClass,
      this.playerDecks[this.selectedHeroClass],
      {
        onSaveDeck: (newDeck) => {
          this.playerDecks[this.selectedHeroClass] = newDeck;
          yaGames.saveData({ playerDecks: this.playerDecks, gold: this.gold });
          alert('Колода успешно сохранена!');
          this.showMenu();
        },
        onBackToMenu: () => {
          this.showMenu();
        }
      }
    );

    deckBuilder.render();
  }

  startGame() {
    this.currentView = 'GAME';

    // Pick opponent hero class distinct or random
    const opponentClasses = ['MAGE', 'WARRIOR', 'HUNTER'];
    const opponentClass = opponentClasses[Math.floor(Math.random() * opponentClasses.length)];

    const playerDeck = this.playerDecks[this.selectedHeroClass];
    const opponentDeck = createStarterDeck(opponentClass);

    const gameEngine = new GameEngine(this.selectedHeroClass, opponentClass, playerDeck, opponentDeck);
    const combatController = new CombatController(gameEngine);
    const aiController = new AIController(gameEngine, combatController);

    const boardView = new BoardView(
      this.appContainer,
      gameEngine,
      combatController,
      aiController,
      {
        onRestartGame: () => {
          this.startGame();
        },
        onBackToMenu: () => {
          // If player won, update leaderboard
          if (gameEngine.winner === 'PLAYER') {
            yaGames.setLeaderboardScore('wins', 1);
          }
          this.showMenu();
        }
      }
    );

    boardView.render();
  }
}

// Instantiate app when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  const app = new Application();
  app.start();
});
