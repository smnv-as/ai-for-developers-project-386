# Booking API

TypeSpec-спецификация API для сервиса бронирования 30-минутных слотов.

## Быстрый старт

```bash
# Установка зависимостей
make install

# Компиляция TypeSpec в OpenAPI
make compile

# Проверка спецификации
make check

# Очистка артефактов
make clean
```

## Структура проекта

```
├── main.tsp          # TypeSpec-спецификация
├── openapi.yaml     # Сгенерированный OpenAPI-контракт
├── package.json     # Зависимости npm
├── tspconfig.yaml   # Конфигурация TypeSpec-компилятора
└── Makefile         # Команды сборки
```

## API Endpoints

### Публичные (гость)

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/event-types` | Список типов событий |
| GET | `/slots?eventTypeId=&from=&to=` | Доступные слоты |
| POST | `/bookings` | Создать бронирование |
| DELETE | `/bookings/{id}` | Отменить бронирование |

### Админские (`/admin`)

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/admin/event-types` | Список типов событий |
| POST | `/admin/event-types` | Создать тип события |
| PUT | `/admin/event-types/{id}` | Обновить тип события |
| DELETE | `/admin/event-types/{id}` | Удалить тип события |
| GET | `/admin/bookings?from=&to=&eventTypeId=` | Список бронирований |

## Бизнес-правила

- Все события **ровно 30 минут**
- Рабочие часы: **09:00–18:00**, пн–пт, **Europe/Moscow**
- Окно бронирования: **14 дней** от текущей даты
- Слоты только на границах **xx:00** и **xx:30**
- При удалении типа события **каскадно удаляются** все его бронирования
- Бронирования хранятся как **hard delete** (без статуса)

## Модели данных

### EventType
```json
{ "id": "uuid", "name": "string", "description": "string" }
```

### Booking
```json
{
  "id": "uuid",
  "eventTypeId": "uuid",
  "startTime": "utcDateTime",
  "endTime": "utcDateTime",
  "guestName": "string",
  "guestEmail": "string",
  "guestPhone": "string?",
  "notes": "string?"
}
```

### Slot
```json
{ "startTime": "utcDateTime", "endTime": "utcDateTime" }
```

## Коды ошибок

| Код | HTTP | Описание |
|-----|------|----------|
| `not_found` | 404 | Ресурс не найден |
| `slot_already_booked` | 409 | Слот уже занят |
| `validation_error` | 422 | Ошибка валидации |
| `event_type_has_bookings` | 409 | Нельзя удалить тип с бронированиями |

## Генерация OpenAPI

После `make compile` результат появится в `tsp-output/@typespec/openapi3/openapi.yaml`. Для удобства используется копия в корне — `openapi.yaml`.

## Разработка

```bash
# Полная пересборка
make clean && make install && make compile
```

### Hexlet tests and linter status:
[![Actions Status](https://github.com/smnv-as/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/smnv-as/ai-for-developers-project-386/actions)