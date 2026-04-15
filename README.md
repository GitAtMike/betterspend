# BetterSpend

A cross-platform personal finance tracker built with React Native, Expo, and TypeScript. Log transactions by merchant, amount, category, and account type — with full create, edit, and delete support. Runs on iOS, Android, and web.

---

## Features

- Add transactions with merchant, amount, category, and account type (debit/credit/cash)
- View all transactions sorted by date, newest first
- Edit or delete any transaction via a slide-up modal
- Date picker for editing transaction dates
- Home dashboard with total monthly spending and category breakdown
- Donut chart visualizing spending by category
- Budget management — set an overall budget and per-category budgets with warning thresholds
- Color-coded spending bars (green/yellow/red) based on budget thresholds
- All data is stored locally on-device — no accounts, no cloud, no data sharing
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
| Charts            | react-native-svg (custom donut chart)         |
| Sliders           | `@react-native-community/slider`              |

---

## Project Structure

```
betterspend/
├── app/
│   ├── _layout.tsx          # Root layout — initializes DB, sets theme
│   ├── modal.tsx            # Modal screen
│   └── (tabs)/
│       ├── _layout.tsx      # Tab bar configuration
│       ├── index.tsx        # Home dashboard — spending summary + donut chart
│       ├── add.tsx          # Add transaction screen
│       ├── transactions.tsx # Transaction list + edit modal
│       └── budget.tsx       # Budget management screen
├── src/
│   ├── db.ts                # SQLite layer (iOS/Android)
│   └── db.web.ts            # localStorage layer (web — auto-selected by Expo)
├── components/
│   └── DonutChart.tsx       # Custom SVG donut chart component
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

Both layers expose the same async API (`initDb`, `addTransaction`, `getAllTransactions`, `updateTransaction`, `deleteTransaction`, `setBudget`, `getBudgets`, `removeBudget`), so all screens work identically across platforms with no conditional logic in the UI.

All data is stored locally on the user's device. No accounts are required and no data is transmitted to any server.

---

## Categories

Groceries, Rent, Dining, Gas, Entertainment, Utilities, Shopping, Travel, Health, Other

---

## Roadmap

- [x] Spending summary and charts by category
- [x] Monthly budget limits with warning thresholds
- [x] Color-coded budget warnings on home screen
- [x] Overall budget progress on hero card
- [x] CSV export
- [ ] Month-over-month spending comparison
- [ ] Push notifications for budget warnings
- [ ] Recurring transactions
- [ ] Multiple named accounts
- [ ] iCloud/Google Drive sync
- [ ] Multi-device sync
- [ ] User accounts
- [ ] Bank sync via Plaid
