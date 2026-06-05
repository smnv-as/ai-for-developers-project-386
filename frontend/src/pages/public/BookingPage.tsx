import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Typography, TextField, Button, Box, Paper, Alert, Snackbar } from '@mui/material'
import { PublicLayout } from '../../components/PublicLayout'
import { bookingsApi, ApiError } from '../../api/client'
import type { CreateBookingRequest } from '../../api/types'

export const BookingPage = () => {
  const [searchParams] = useSearchParams()
  const eventTypeId = searchParams.get('eventTypeId') ?? ''
  const startTime = searchParams.get('startTime') ?? ''

  const [form, setForm] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!form.guestName.trim()) newErrors.guestName = 'Введите имя'
    if (!form.guestEmail.trim()) {
      newErrors.guestEmail = 'Введите email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guestEmail)) {
      newErrors.guestEmail = 'Некорректный email'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const request: CreateBookingRequest = {
        eventTypeId,
        startTime,
        guestName: form.guestName,
        guestEmail: form.guestEmail,
        guestPhone: form.guestPhone,
        notes: form.notes,
      }
      await bookingsApi.create(request)
      navigate('/success')
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'slot_already_booked') {
          setSnackbar({ open: true, message: 'Этот слот уже забронирован. Выберите другой.', severity: 'error' })
        } else if (err.code === 'validation_error') {
          setSnackbar({ open: true, message: err.message, severity: 'error' })
        } else {
          setSnackbar({ open: true, message: err.message, severity: 'error' })
        }
      } else {
        setSnackbar({ open: true, message: 'Произошла ошибка', severity: 'error' })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <PublicLayout>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Бронирование
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Дата и время: {formatDateTime(startTime)}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }} data-testid="booking-form">
          <TextField
            fullWidth
            label="Имя"
            value={form.guestName}
            onChange={handleChange('guestName')}
            error={!!errors.guestName}
            helperText={errors.guestName}
            sx={{ mb: 2 }}
            slotProps={{
              htmlInput: { 'data-testid': 'guest-name-input' }
            }}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={form.guestEmail}
            onChange={handleChange('guestEmail')}
            error={!!errors.guestEmail}
            helperText={errors.guestEmail}
            sx={{ mb: 2 }}
            slotProps={{
              htmlInput: { 'data-testid': 'guest-email-input' }
            }}
          />
          <TextField
            fullWidth
            label="Телефон (необязательно)"
            value={form.guestPhone}
            onChange={handleChange('guestPhone')}
            sx={{ mb: 2 }}
            slotProps={{
              htmlInput: { 'data-testid': 'guest-phone-input' }
            }}
          />
          <TextField
            fullWidth
            label="Заметки (необязательно)"
            value={form.notes}
            onChange={handleChange('notes')}
            multiline
            rows={3}
            sx={{ mb: 3 }}
            slotProps={{
              htmlInput: { 'data-testid': 'guest-notes-input' }
            }}
          />
          <Button type="submit" variant="contained" disabled={loading} data-testid="submit-booking-button">
            {loading ? 'Отправка...' : 'Забронировать'}
          </Button>
        </Box>
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} data-testid="booking-error-alert">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PublicLayout>
  )
}
