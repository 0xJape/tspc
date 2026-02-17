# 🎨 Baseline.live Design Implementation Guide

Complete guide to replicate Baseline's clean, modern aesthetic in your pickleball club website.

---

## 🎨 Color Palette

```css
/* Primary Colors */
--baseline-green: #10b981;      /* Main brand color */
--baseline-green-dark: #059669;  /* Hover states */
--baseline-green-light: #d1fae5; /* Backgrounds */

/* Neutrals */
--white: #ffffff;
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-500: #6b7280;
--gray-700: #374151;
--gray-900: #111827;

/* Status Colors */
--success: #10b981;  /* Finished/Won */
--warning: #f59e0b;  /* Ongoing */
--info: #3b82f6;     /* Upcoming */
--danger: #ef4444;   /* Cancelled/Lost */
```

---

## 🔤 Typography

**Font:** System UI / Inter / Roboto

```css
/* Tailwind CSS Classes */
text-xs     /* 12px - Labels, captions */
text-sm     /* 14px - Secondary text */
text-base   /* 16px - Body text */
text-lg     /* 18px - Subheadings */
text-xl     /* 20px - Card titles */
text-2xl    /* 24px - Page titles */
text-3xl    /* 30px - Hero headlines */

/* Font Weights */
font-normal   /* 400 - Body text */
font-medium   /* 500 - Emphasized text */
font-semibold /* 600 - Headings */
font-bold     /* 700 - Important titles */
```

---

## 📦 Component Designs

### 1. Navbar
```jsx
<nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <img src="/logo.png" alt="Logo" className="h-8 w-8" />
        <span className="text-xl font-semibold text-gray-900">PickleClub</span>
      </div>
      
      {/* Navigation Links */}
      <div className="hidden md:flex space-x-8">
        <a href="/" className="text-gray-700 hover:text-baseline-green font-medium">
          Home
        </a>
        <a href="/rankings" className="text-gray-700 hover:text-baseline-green font-medium">
          Rankings
        </a>
        <a href="/tournaments" className="text-gray-700 hover:text-baseline-green font-medium">
          Tournaments
        </a>
        <a href="/members" className="text-gray-700 hover:text-baseline-green font-medium">
          Members
        </a>
      </div>
      
      {/* CTA Button */}
      <button className="bg-baseline-green text-white px-4 py-2 rounded-lg hover:bg-baseline-green-dark transition">
        Login
      </button>
    </div>
  </div>
</nav>
```

---

### 2. Player/Member Card
```jsx
<div className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 p-4">
  {/* Player Avatar */}
  <div className="flex items-center space-x-4">
    <img 
      src={avatar} 
      alt={name}
      className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
    />
    
    <div className="flex-1">
      <h3 className="font-semibold text-gray-900">{name}</h3>
      <p className="text-sm text-gray-500">{skillLevel}</p>
    </div>
    
    {/* Rank Badge */}
    <div className="bg-baseline-green text-white px-3 py-1 rounded-full text-sm font-semibold">
      #{rank}
    </div>
  </div>
  
  {/* Stats */}
  <div className="mt-4 flex justify-between text-sm">
    <div>
      <span className="text-gray-500">Wins:</span>
      <span className="font-semibold text-gray-900 ml-1">{wins}</span>
    </div>
    <div>
      <span className="text-gray-500">Losses:</span>
      <span className="font-semibold text-gray-900 ml-1">{losses}</span>
    </div>
    <div>
      <span className="text-gray-500">Points:</span>
      <span className="font-semibold text-baseline-green ml-1">{points}</span>
    </div>
  </div>
</div>
```

---

### 3. Match/Schedule Card
```jsx
<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
  {/* Header */}
  <div className="flex justify-between items-start mb-4">
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500">{tournament}</p>
    </div>
    
    {/* Status Badge */}
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
      Finished
    </span>
  </div>
  
  {/* Players */}
  <div className="space-y-3">
    {/* Player 1 */}
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <img src={player1.avatar} className="w-8 h-8 rounded-full" />
        <span className="font-medium text-gray-900">{player1.name}</span>
      </div>
      <span className="text-2xl font-bold text-gray-900">{score1}</span>
    </div>
    
    {/* Player 2 */}
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <img src={player2.avatar} className="w-8 h-8 rounded-full" />
        <span className="font-medium text-gray-900">{player2.name}</span>
      </div>
      <span className="text-2xl font-bold text-gray-900">{score2}</span>
    </div>
  </div>
  
  {/* Match Code */}
  <div className="mt-4 pt-4 border-t border-gray-100">
    <span className="text-xs text-gray-500 font-mono">{matchCode}</span>
  </div>
</div>
```

---

### 4. Tournament Card
```jsx
<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
  <div className="flex justify-between items-start mb-4">
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{name}</h3>
      <div className="space-y-1">
        <p className="text-sm text-gray-500 flex items-center">
          <CalendarIcon className="w-4 h-4 mr-2" />
          {date}
        </p>
        <p className="text-sm text-gray-500 flex items-center">
          <MapPinIcon className="w-4 h-4 mr-2" />
          {location}
        </p>
      </div>
    </div>
    
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
      {status}
    </span>
  </div>
  
  {/* Category & Level */}
  <div className="flex gap-2 mb-4">
    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
      {category}
    </span>
    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
      {skillLevel}
    </span>
  </div>
  
  <button className="w-full bg-baseline-green text-white py-2 rounded-lg hover:bg-baseline-green-dark transition font-medium">
    Register Now
  </button>
</div>
```

---

### 5. Rankings Table
```jsx
<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
  <table className="w-full">
    <thead className="bg-gray-50 border-b border-gray-100">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Rank
        </th>
        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Player
        </th>
        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Wins
        </th>
        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Losses
        </th>
        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Points
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-100">
      {players.map((player, index) => (
        <tr key={player.id} className="hover:bg-gray-50 transition">
          <td className="px-6 py-4">
            <span className={`font-bold text-lg ${
              index === 0 ? 'text-yellow-500' :
              index === 1 ? 'text-gray-400' :
              index === 2 ? 'text-orange-600' :
              'text-gray-900'
            }`}>
              {index + 1}
            </span>
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center space-x-3">
              <img src={player.avatar} className="w-10 h-10 rounded-full" />
              <div>
                <p className="font-semibold text-gray-900">{player.name}</p>
                <p className="text-sm text-gray-500">{player.skillLevel}</p>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 text-gray-900 font-medium">{player.wins}</td>
          <td className="px-6 py-4 text-gray-900 font-medium">{player.losses}</td>
          <td className="px-6 py-4">
            <span className="font-bold text-baseline-green">{player.points}</span>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

---

## 🎯 Key Design Principles

### Spacing
- **Padding**: `p-4`, `p-6` for cards
- **Gaps**: `gap-4`, `gap-6` for grid layouts
- **Margins**: `mb-4`, `mb-6` between sections

### Shadows
- **Default**: `shadow-sm` (subtle)
- **Hover**: `hover:shadow-md`
- **Elevated**: `shadow-lg` (modals)

### Borders
- **Color**: `border-gray-100` (very subtle)
- **Radius**: `rounded-lg` (8px), `rounded-xl` (12px)

### Responsiveness
```jsx
{/* Mobile-first approach */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>

{/* Hide on mobile */}
<div className="hidden md:block">
  {/* Desktop content */}
</div>

{/* Mobile menu */}
<div className="md:hidden">
  {/* Mobile menu */}
</div>
```

---

## 🚀 Animation & Transitions

```css
/* Add to tailwind.config.js */
module.exports = {
  theme: {
    extend: {
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      }
    }
  }
}
```

```jsx
{/* Smooth transitions */}
<div className="transition-all duration-300 ease-in-out hover:scale-105">
  {/* Content */}
</div>

{/* Shadow transition */}
<div className="shadow-sm hover:shadow-md transition-shadow duration-200">
  {/* Content */}
</div>
```

---

## 📱 Mobile Considerations

- Sticky header on scroll
- Bottom navigation on mobile
- Touch-friendly button sizes (min 44px)
- Swipeable cards
- Collapsible filters

---

## ✨ Final Tips

1. **Consistency**: Use the same spacing, colors, and components throughout
2. **White Space**: Don't cram too much - let content breathe
3. **Hierarchy**: Use size, weight, and color to show importance
4. **Performance**: Optimize images, use lazy loading
5. **Accessibility**: Proper contrast, alt text, keyboard navigation
