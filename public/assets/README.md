# Инструкция по добавлению спрайтов, изображений и картинок карт

Все пользовательские изображения, иллюстрации карт, портреты героев и иконки эффектов хранятся в папке **`public/assets/`**.

## 1. Где генерировать или брать изображения?
Вы можете сгенерировать иллюстрации для карт и героев с помощью нейросетей (Midjourney, Stable Diffusion, DALL-E 3, Kandinsky или Leonardo.ai):

* **Размер карт:** рекомендуется 512x512 или 300x400 пикселей в формате PNG или WEBP.
* **Стиль (Промпты):**
  * *Фэнтези карта Hearthstone style, fantasy card art, digital painting, vibrant colors, detailed illustration*.
  * Для существ: *Fantasy creature character portrait, hearthstone art style, transparent background or epic fantasy background*.
  * Для заклинаний: *Magic fireball spell effect, glowing arcane magic, epic fantasy spell illustration*.

## 2. Структура папки `public/assets/`
Рекомендуется раскладывать файлы по подпапкам:

```
public/assets/
├── heroes/          # Портреты героев (mage.png, warrior.png, hunter.png)
├── cards/           # Иллюстрации для карт (fireball.png, boar.png, footman.png)
└── animations/      # Спрайты анимированных эффектов / гифки
```

## 3. Как подключить изображения в коде проекта?

### В `src/engine/cards.js`:
Добавьте свойство `image` или измените `icon` у нужной карты:

```javascript
{
  id: 'mage_fireball',
  name: 'Огненный шар',
  type: 'SPELL',
  heroClass: HERO_CLASSES.MAGE,
  cost: 4,
  description: 'Наносит 6 ед. урона выбранной цели.',
  icon: '🔥',
  image: '/assets/cards/fireball.png', // <-- Путь к вашему файлу
  effect: { type: 'DAMAGE', amount: 6, target: 'ANY' }
}
```

### В CSS (`src/style.css`):
Если вы хотите использовать картинку карты или существа на поле боя:

```css
.card-in-hand[data-card-id="mage_fireball"] .card-icon {
  background-image: url('/assets/cards/fireball.png');
  background-size: cover;
}
```

Или в `src/ui/boardView.js` в методе `renderPlayerHand()`:
```javascript
<div class="card-icon">
  ${card.image ? `<img src="${card.image}" class="card-img" />` : (card.icon || '🃏')}
</div>
```
