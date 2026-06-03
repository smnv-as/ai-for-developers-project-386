# Booking API Frontend

React-приложение для системы бронирования 30-минутных слотов.

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера (с моком API)
npm run dev

# Запуск тестов
npm run test
npm run test:run

# Сборка
npm run build
```

## Переменные окружения

```bash
VITE_USE_MOCK=true    # Использовать MSW мок (по умолчанию)
VITE_API_URL=/api     # Базовый URL API
```

Для работы с реальным бэкендом:

```bash
VITE_USE_MOCK=false
VITE_API_URL=http://localhost:3001
```

## Архитектура

```
src/
├── api/
│   ├── client.ts      # Axios-клиент для API
│   └── types.ts       # TypeScript-типы из OpenAPI
├── components/
│   ├── PublicLayout.tsx  # Лейаут для публичных страниц
│   └── ErrorBoundary.tsx # Обработка ошибок React
├── i18n/
│   └── ru.ts          # Русские переводы (react-admin)
├── mocks/
│   ├── browser.ts     # MSW browser worker
│   ├── server.ts      # MSW node server (тесты)
│   ├── handlers.ts    # Обработчики API endpoints
│   ├── dataStore.ts   # In-memory хранилище
│   └── businessLogic.ts # Бизнес-логика (генерация слотов, валидация)
├── pages/
│   ├── public/
│   │   ├── HomePage.tsx
│   │   ├── SlotsPage.tsx
│   │   ├── BookingPage.tsx
│   │   └── BookingSuccess.tsx
│   └── admin/
│       ├── AdminApp.tsx
│       ├── EventTypeResource.tsx
│       ├── BookingResource.tsx
│       └── dataProvider.ts
├── theme.ts           # MUI theme
├── App.tsx            # Роутер приложения
└── main.tsx           # Точка входа
```

## Публичный флоу

1. `/` — выбор типа события
2. `/slots?eventTypeId=` — просмотр доступных слотов
3. `/booking?eventTypeId=&startTime=` — форма бронирования
4. `/success` — подтверждение

## Админка

`/admin` — React-admin панель:
- CRUD для типов событий
- Просмотр бронирований
- Фильтрация по датам и типу события

## API контракт

Контракт API описан в TypeSpec и сгенерирован в `openapi.yaml` в корне проекта.
