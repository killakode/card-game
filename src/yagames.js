/**
 * Yandex Games SDK Wrapper
 * Handles SDK initialization, player progress saving/loading, ad rewards, and leaderboards.
 * Fallbacks to localStorage for local dev/testing.
 */

class YaGamesManager {
  constructor() {
    this.ysdk = null;
    this.player = null;
    this.lb = null;
    this.isInitialized = false;
  }

  async init() {
    if (typeof window !== 'undefined' && window.YaGames) {
      try {
        this.ysdk = await window.YaGames.init();
        console.log('[YaGames] SDK initialized successfully');
        try {
          this.player = await this.ysdk.getPlayer({ scopes: false });
        } catch (e) {
          console.warn('[YaGames] Player init fallback', e);
        }
        try {
          this.lb = await this.ysdk.getLeaderboards();
        } catch (e) {
          console.warn('[YaGames] Leaderboard init fallback', e);
        }
      } catch (err) {
        console.warn('[YaGames] SDK init error, using offline mock:', err);
      }
    } else {
      console.log('[YaGames] YaGames SDK not found. Running in offline/dev mock mode.');
    }
    this.isInitialized = true;
  }

  async saveData(data) {
    if (this.player) {
      try {
        await this.player.setData(data, true);
        console.log('[YaGames] Data saved to Yandex Cloud', data);
        return true;
      } catch (e) {
        console.error('[YaGames] Error saving to cloud:', e);
      }
    }
    // Fallback to localStorage
    try {
      localStorage.setItem('hearthstone_ya_save', JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('[YaGames] LocalStorage save error:', e);
      return false;
    }
  }

  async loadData() {
    if (this.player) {
      try {
        const data = await this.player.getData();
        console.log('[YaGames] Data loaded from Yandex Cloud', data);
        if (data && Object.keys(data).length > 0) {
          return data;
        }
      } catch (e) {
        console.error('[YaGames] Error loading from cloud:', e);
      }
    }
    // Fallback to localStorage
    try {
      const local = localStorage.getItem('hearthstone_ya_save');
      return local ? JSON.parse(local) : null;
    } catch (e) {
      console.error('[YaGames] LocalStorage load error:', e);
      return null;
    }
  }

  showRewardedVideo(onRewarded, onClose) {
    if (this.ysdk && this.ysdk.adv) {
      this.ysdk.adv.showRewardedVideo({
        callbacks: {
          onOpen: () => console.log('[YaGames] Video ad opened'),
          onRewarded: () => {
            console.log('[YaGames] Reward granted');
            if (onRewarded) onRewarded();
          },
          onClose: () => {
            console.log('[YaGames] Video ad closed');
            if (onClose) onClose();
          },
          onError: (e) => {
            console.error('[YaGames] Video ad error:', e);
            if (onClose) onClose();
          }
        }
      });
    } else {
      // Mock ad behavior for local dev
      console.log('[YaGames Mock] Video ad simulated');
      setTimeout(() => {
        if (onRewarded) onRewarded();
        if (onClose) onClose();
      }, 500);
    }
  }

  async setLeaderboardScore(boardName, score) {
    if (this.lb) {
      try {
        await this.lb.setLeaderboardScore(boardName, score);
        console.log(`[YaGames] Score ${score} set for leaderboard ${boardName}`);
      } catch (e) {
        console.error('[YaGames] Error setting leaderboard score:', e);
      }
    } else {
      console.log(`[YaGames Mock] Leaderboard ${boardName} score: ${score}`);
    }
  }
}

export const yaGames = new YaGamesManager();
