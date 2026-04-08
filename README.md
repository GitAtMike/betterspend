# BetterSpend

A cross-platform personal finance tracker built with React Native, Expo, and TypeScript. Log transactions by merchant, amount, category, and account type — with full create, edit, and delete support. Runs on iOS, Android, and web.

---

## Features

- Add transactions with merchant, amount, category, and account type (debit/credit/cash)
- View all transactions sorted by date, newest first
- Edit or delete any transaction via a slide-up modal
- Date picker for editing transaction dates
- Persistent storage — SQLite on mobile, localStorage on web
- Dark mode support via system color scheme
- Haptic feedback on tab navigation (iOS/Android)

---

## Tech Stack

| Layer             | Technology                                    |
| ----------------- | --------------------------------------------- |
| Framework         | [Expo](https://expo.dev) ~54 with Expo Router |
| Language          | TypeScript                                    |
| UI                | React Native                                  |
| Database (mobile) | expo-sqlite (SQLite via WAL mode)             |
| Database (web)    | localStorage (platform-specific fallback)     |
| Navigation        | Expo Router file-based tabs                   |
| Icons             | SF Symbols via `@expo/vector-icons`           |
| Date Picker       | `@react-native-community/datetimepicker`      |

---

## Project Structure

```
betterspend/
├── app/
│   ├── _layout.tsx          # Root layout — initializes DB, sets theme
│   ├── modal.tsx            # Modal screen
│   └── (tabs)/
│       ├── _layout.tsx      # Tab bar configuration
│       ├── index.tsx        # Home screen
│       ├── add.tsx          # Add transaction screen
│       └── transactions.tsx # Transaction list + edit modal
├── src/
│   ├── db.ts                # SQLite layer (iOS/Android)
│   └── db.web.ts            # localStorage layer (web — auto-selected by Expo)
├── components/              # Shared UI components
├── constants/
│   └── theme.ts             # Color tokens
├── hooks/                   # Custom hooks (useColorScheme, etc.)
├── metro.config.js          # Custom Metro config for web wasm exclusion
└── app.json                 # Expo config
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Expo Go](https://expo.dev/client) on your phone (for mobile)

### Install

```bash
git clone https://github.com/GitAtMike/betterspend.git
cd betterspend
npm install
```

### Run

```bash
# Mobile (iOS/Android via Expo Go)
npx expo start

# Web
npx expo start --web
```

For mobile, scan the QR code with Expo Go (Android) or the Camera app (iOS).

---

## Data Persistence

BetterSpend uses a platform-specific storage strategy:

- **iOS/Android** — SQLite via `expo-sqlite` with WAL journaling for performance
- **Web** — `localStorage` via `src/db.web.ts`, automatically selected by Expo's Metro bundler

Both layers expose the same async API (`initDb`, `addTransaction`, `getAllTransactions`, `updateTransaction`, `deleteTransaction`), so all screens work identically across platforms with no conditional logic in the UI.

---

## Categories

Groceries, Rent, Dining, Gas, Entertainment, Utilities, Shopping, Travel, Health, Other

---

## Roadmap

- [ ] Spending summary and charts by category
- [ ] Monthly budget limits with alerts
- [ ] CSV export
- [ ] Bank sync via Plaid
