package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/labstack/echo/v4"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"booking-api/internal/api"
	"booking-api/internal/repository"
	"booking-api/internal/service"
)

func setupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"))
	if err != nil {
		t.Fatalf("failed to open test db: %v", err)
	}
	return db
}

func setupHandler(t *testing.T) (*Handler, *gorm.DB) {
	db := setupTestDB(t)
	repo := repository.New(db)
	if err := repo.AutoMigrate(); err != nil {
		t.Fatalf("failed to migrate: %v", err)
	}
	svc := service.New(repo)
	h := New(svc)
	return h, db
}

func closeDB(db *gorm.DB) {
	sqlDB, _ := db.DB()
	if sqlDB != nil {
		sqlDB.Close()
	}
}

func TestHealthEndpoint(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	testHandler := func(c echo.Context) error {
		return c.JSON(200, map[string]string{"status": "ok"})
	}

	if err := testHandler(c); err != nil {
		t.Fatalf("handler returned error: %v", err)
	}

	if rec.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", rec.Code)
	}

	var resp map[string]string
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}
	if resp["status"] != "ok" {
		t.Errorf("expected status ok, got %s", resp["status"])
	}
}

func TestEventTypesRoundTrip(t *testing.T) {
	h, db := setupHandler(t)
	defer closeDB(db)

	e := echo.New()
	api.RegisterHandlers(e, api.NewStrictHandler(h, nil))

	body := `{"name":"Test Type","description":"Test Description"}`
	req := httptest.NewRequest(http.MethodPost, "/admin/event-types", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	e.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("POST /admin/event-types returned %d: %s", rec.Code, rec.Body.String())
	}

	var created api.EventType
	if err := json.Unmarshal(rec.Body.Bytes(), &created); err != nil {
		t.Fatalf("failed to unmarshal: %v", err)
	}
	if created.Name != "Test Type" {
		t.Errorf("expected name 'Test Type', got '%s'", created.Name)
	}
	if created.Description != "Test Description" {
		t.Errorf("expected description 'Test Description', got '%s'", created.Description)
	}
	if created.Id == "" {
		t.Error("expected non-empty id")
	}

	req = httptest.NewRequest(http.MethodGet, "/event-types", nil)
	rec = httptest.NewRecorder()
	e.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("GET /event-types returned %d", rec.Code)
	}

	var list []api.EventType
	if err := json.Unmarshal(rec.Body.Bytes(), &list); err != nil {
		t.Fatalf("failed to unmarshal list: %v", err)
	}
	if len(list) != 1 {
		t.Errorf("expected 1 event type, got %d", len(list))
	}
}

func TestCreateAndCancelBooking(t *testing.T) {
	h, db := setupHandler(t)
	defer closeDB(db)

	svc := h.svc
	ctx := context.Background()

	eventType, err := svc.CreateEventType(ctx, &repository.EventTypeEntity{
		ID:          "type-1",
		Name:        "Consultation",
		Description: "30 min consultation",
	})
	if err != nil {
		t.Fatalf("failed to create event type: %v", err)
	}

	booking, err := svc.CreateBooking(ctx, &repository.BookingEntity{
		EventTypeID: eventType.ID,
		StartTime:   mustParseTime(t, "2026-06-08T10:00:00Z"),
		EndTime:     mustParseTime(t, "2026-06-08T10:30:00Z"),
		GuestName:   "John Doe",
		GuestEmail:  "john@example.com",
	})
	if err != nil {
		t.Fatalf("failed to create booking: %v", err)
	}
	if booking.ID == "" {
		t.Error("expected non-empty booking id")
	}

	err = svc.CancelBooking(ctx, booking.ID)
	if err != nil {
		t.Fatalf("failed to cancel booking: %v", err)
	}

	_, err = svc.GetBooking(ctx, booking.ID)
	if err == nil {
		t.Error("expected not found error after cancellation")
	}
}

func TestSlotGeneration(t *testing.T) {
	h, db := setupHandler(t)
	defer closeDB(db)

	svc := h.svc
	ctx := context.Background()

	eventType, _ := svc.CreateEventType(ctx, &repository.EventTypeEntity{
		ID:          "type-1",
		Name:        "Consultation",
		Description: "30 min",
	})

	slots, err := svc.ListSlots(ctx, eventType.ID, nil, nil)
	if err != nil {
		t.Fatalf("failed to list slots: %v", err)
	}

	if len(slots) == 0 {
		t.Error("expected some slots to be generated")
	}

	for _, slot := range slots {
		if slot.End.Sub(slot.Start) != 30*time.Minute {
			t.Errorf("slot duration should be 30 minutes, got %v", slot.End.Sub(slot.Start))
		}
	}
}

func TestBookingValidation_OutsideWorkingHours(t *testing.T) {
	h, db := setupHandler(t)
	defer closeDB(db)

	svc := h.svc
	ctx := context.Background()

	eventType, _ := svc.CreateEventType(ctx, &repository.EventTypeEntity{
		ID:   "type-1",
		Name: "Test",
	})

	_, err := svc.CreateBooking(ctx, &repository.BookingEntity{
		EventTypeID: eventType.ID,
		StartTime:   mustParseTime(t, "2026-06-08T20:00:00Z"),
		GuestName:   "Test",
		GuestEmail:  "test@example.com",
	})
	if err == nil {
		t.Error("expected validation error for outside working hours")
	}
}

func TestBookingValidation_Weekend(t *testing.T) {
	h, db := setupHandler(t)
	defer closeDB(db)

	svc := h.svc
	ctx := context.Background()

	eventType, _ := svc.CreateEventType(ctx, &repository.EventTypeEntity{
		ID:   "type-1",
		Name: "Test",
	})

	_, err := svc.CreateBooking(ctx, &repository.BookingEntity{
		EventTypeID: eventType.ID,
		StartTime:   mustParseTime(t, "2026-06-06T10:00:00Z"),
		GuestName:   "Test",
		GuestEmail:  "test@example.com",
	})
	if err == nil {
		t.Error("expected validation error for weekend booking")
	}
}

func TestMain(m *testing.M) {
	os.Exit(m.Run())
}

func mustParseTime(t *testing.T, s string) time.Time {
	tt, err := time.Parse(time.RFC3339, s)
	if err != nil {
		t.Fatalf("failed to parse time %s: %v", s, err)
	}
	return tt
}
