# Booking API E2E Test Plan

## Application Overview

Booking API — сервис бронирования 30-минутных слотов. Публичный UI для гостей (выбор типа события, просмотр слотов, форма бронирования) и административная панель на react-admin для управления типами событий и бронированиями. Без аутентификации. Бизнес-правила: слоты только по будням 09:00–18:00 Europe/Moscow, окно бронирования 14 дней, границы слотов на :00 и :30.

## Test Environment

- Frontend: http://localhost:3000 (Vite dev server, VITE_USE_MOCK=false)
- Backend API: http://localhost:8080 (Go/Echo + SQLite)
- Seed data: создаётся через API в `test.beforeEach`

---

## Test Scenarios

### 1. Guest Flow (Smoke)

**Seed:** tests/seed.spec.ts

#### 1.1. should-view-event-types

**File:** tests/guest/should-view-event-types.spec.ts

**Steps:**
  1. Открыть главную страницу `/`
     - expect: Отображается заголовок "Выберите тип события"
     - expect: Присутствуют карточки типов событий (минимум 1)
  2. Проверить структуру карточек
     - expect: Каждая карточка содержит название (name)
     - expect: Каждая карточка содержит описание (description)

#### 1.2. should-navigate-to-slots

**File:** tests/guest/should-navigate-to-slots.spec.ts

**Steps:**
  1. Открыть главную страницу `/`
  2. Нажать кнопку "Выбрать" на первой карточке типа события
     - expect: URL содержит параметр `eventTypeId`
     - expect: Происходит переход на страницу `/slots`

#### 1.3. should-view-available-slots

**File:** tests/guest/should-view-available-slots.spec.ts

**Steps:**
  1. Открыть `/slots?eventTypeId=<id>` (предварительно создать тип события через API)
     - expect: Отображается заголовок "Доступные слоты"
     - expect: Присутствует список слотов (или сообщение "Нет доступных слотов")
  2. Если слоты есть — проверить их формат
     - expect: Каждый слот показывает время начала и конца

#### 1.4. should-navigate-to-booking-form

**File:** tests/guest/should-navigate-to-booking-form.spec.ts

**Steps:**
  1. Открыть `/slots?eventTypeId=<id>` с доступными слотами
  2. Нажать кнопку "Забронировать" на первом слоте
     - expect: URL содержит параметры `eventTypeId` и `startTime`
     - expect: Происходит переход на `/booking`

#### 1.5. should-submit-booking-form

**File:** tests/guest/should-submit-booking-form.spec.ts

**Steps:**
  1. Открыть `/booking?eventTypeId=<id>&startTime=<datetime>`
     - expect: Отображается форма с полями: Имя, Email, Телефон, Заметки
     - expect: Отображается выбранная дата и время
  2. Заполнить поле "Имя" значением "Тестовый Гость"
  3. Заполнить поле "Email" значением "test@example.com"
  4. Нажать кнопку "Забронировать"
     - expect: Происходит переход на `/success`
     - expect: Отображается сообщение "Бронирование успешно!"

#### 1.6. should-cancel-booking

**File:** tests/guest/should-cancel-booking.spec.ts

**Steps:**
  1. Создать бронирование через API
  2. Вызвать `DELETE /bookings/{id}` через API
     - expect: Ответ 204 No Content
  3. Попытка получить информацию о бронировании через API
     - expect: Ответ 404 Not Found (hard delete)

---

### 2. Guest Validation

**Seed:** tests/seed.spec.ts

#### 2.1. should-show-error-for-empty-name

**File:** tests/guest/should-show-error-for-empty-name.spec.ts

**Steps:**
  1. Открыть `/booking?eventTypeId=<id>&startTime=<datetime>`
  2. Оставить поле "Имя" пустым
  3. Заполнить "Email" значением "test@example.com"
  4. Нажать "Забронировать"
     - expect: Отображается сообщение об ошибке валидации (клиентская валидация)

#### 2.2. should-show-error-for-invalid-email

**File:** tests/guest/should-show-error-for-invalid-email.spec.ts

**Steps:**
  1. Открыть `/booking?eventTypeId=<id>&startTime=<datetime>`
  2. Заполнить "Имя" значением "Тест"
  3. Заполнить "Email" значением "not-an-email"
  4. Нажать "Забронировать"
     - expect: Отображается сообщение об ошибке валидации email

#### 2.3. should-show-error-for-already-booked-slot

**File:** tests/guest/should-show-error-for-already-booked-slot.spec.ts

**Steps:**
  1. Создать бронирование через API
  2. Открыть `/booking` с теми же `eventTypeId` и `startTime`
  3. Заполнить форму и отправить
     - expect: Отображается snackbar с ошибкой "Этот слот уже забронирован"

---

### 3. Admin Flow

**Seed:** tests/seed.spec.ts

#### 3.1. should-view-admin-panel

**File:** tests/admin/should-view-admin-panel.spec.ts

**Steps:**
  1. Перейти на `/admin`
     - expect: Отображается административная панель react-admin
     - expect: Присутствуют меню или ресурсы для "event-types" и "bookings"

#### 3.2. should-create-event-type

**File:** tests/admin/should-create-event-type.spec.ts

**Steps:**
  1. Перейти на `/admin/event-types`
  2. Нажать кнопку "Create" или аналогичную
     - expect: Открывается форма создания
  3. Заполнить поле "Название" значением "Новая консультация"
  4. Заполнить поле "Описание" значением "Тестовое описание"
  5. Нажать "Save" или аналогичную кнопку
     - expect: Запись появляется в списке

#### 3.3. should-view-bookings-list

**File:** tests/admin/should-view-bookings-list.spec.ts

**Steps:**
  1. Создать бронирование через API
  2. Перейти на `/admin/bookings`
     - expect: Отображается таблица с бронированиями
     - expect: Созданное бронирование присутствует в списке (id, guestName, guestEmail, startTime)

#### 3.4. should-cascade-delete-event-type

**File:** tests/admin/should-cascade-delete-event-type.spec.ts

**Steps:**
  1. Создать тип события через API
  2. Создать бронирование этого типа через API
  3. Перейти на `/admin/event-types`
  4. Удалить тип события (нажать Delete)
     - expect: Появляется confirm/dialog или удаление происходит сразу
     - expect: После удаления тип события отсутствует в списке
     - expect: Связанное бронирование также удалено (подтвердить через `/admin/bookings`)

---

### 4. Business Rules

**Seed:** tests/seed.spec.ts

#### 4.1. should-generate-slots-on-xx00-and-xx30

**File:** tests/business/should-generate-slots-on-xx00-and-xx30.spec.ts

**Steps:**
  1. Создать тип события через API
  2. Получить список слотов через API `GET /slots?eventTypeId=<id>`
  3. Проверить каждый слот
     - expect: Минуты startTime равны 0 или 30
     - expect: endTime = startTime + 30 минут

#### 4.2. should-generate-slots-only-for-weekdays

**File:** tests/business/should-generate-slots-only-for-weekdays.spec.ts

**Steps:**
  1. Создать тип события через API
  2. Получить список слотов через API
  3. Проверить даты всех слотов
     - expect: Ни один слот не приходится на субботу (getDay() === 6) или воскресенье (getDay() === 0)

#### 4.3. should-generate-slots-only-in-working-hours

**File:** tests/business/should-generate-slots-only-in-working-hours.spec.ts

**Steps:**
  1. Создать тип события через API
  2. Получить список слотов через API
  3. Проверить время всех слотов (в Europe/Moscow)
     - expect: Все слоты начинаются в диапазоне 09:00–17:30
     - expect: Ни один слот не начинается до 09:00 или в 18:00+

#### 4.4. should-enforce-14-day-booking-window

**File:** tests/business/should-enforce-14-day-booking-window.spec.ts

**Steps:**
  1. Создать тип события через API
  2. Попытаться создать бронирование на дату более 14 дней от текущей
     - expect: Возвращается ошибка validation_error с сообщением о 14-дневном окне
  3. Создать бронирование на дату в пределах 14 дней
     - expect: Бронирование создаётся успешно

---

### 5. Integration / Smoke

**Seed:** tests/seed.spec.ts

#### 5.1. should-complete-full-guest-journey

**File:** tests/integration/should-complete-full-guest-journey.spec.ts

**Steps:**
  1. Открыть главную страницу `/`
  2. Запомнить количество типов событий
  3. Нажать "Выбрать" на первом типе события
  4. Дождаться загрузки слотов
  5. Нажать "Забронировать" на первом доступном слоте
  6. Заполнить форму: имя="E2E Гость", email="e2e@example.com"
  7. Нажать "Забронировать"
  8. Проверить отображение страницы успеха
     - expect: Переход на `/success`
     - expect: Сообщение "Бронирование успешно!"
  9. Перейти в админку `/admin/bookings`
     - expect: В списке присутствует только что созданное бронирование с guestName="E2E Гость"

#### 5.2. should-sync-admin-created-event-types

**File:** tests/integration/should-sync-admin-created-event-types.spec.ts

**Steps:**
  1. Создать новый тип события через API (POST /admin/event-types)
  2. Открыть главную страницу `/`
     - expect: В списке присутствует только что созданный тип события с корректным name и description

#### 5.3. should-reflect-booking-in-admin-immediately

**File:** tests/integration/should-reflect-booking-in-admin-immediately.spec.ts

**Steps:**
  1. Создать тип события через API
  2. Создать бронирование через API
  3. Открыть `/admin/bookings`
     - expect: В таблице отображается созданное бронирование со всеми полями (id, eventTypeId, guestName, guestEmail, startTime, endTime)

---

## Notes

- Каждый тест начинается с чистого состояния благодаря `test.beforeEach` в фикстурах или отдельным API-запросам на создание данных.
- Для тестов каскадного удаления (3.4) и бизнес-правил (4.x) используется прямой вызов API через `fetch` в дополнение к UI-тестированию.
- При падении теста с локатором — использовать `playwright-cli` для исследования актуальной структуры страницы.
- Расхождение: TypeSpec декларирует каскадное удаление EventType→Bookings, но бэкенд (`service.go`) возвращает ошибку при наличии бронирований. Тест 3.4 ожидает каскадное удаление (согласно решению), поэтому изначально будет падать. После исправления бэкенда тест должен проходить.