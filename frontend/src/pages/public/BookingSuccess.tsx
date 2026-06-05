import { Typography, Paper, Button } from '@mui/material'
import { Link } from 'react-router-dom'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { PublicLayout } from '../../components/PublicLayout'

export const BookingSuccess = () => {
  return (
    <PublicLayout>
      <Paper sx={{ p: 4, textAlign: 'center' }} data-testid="booking-success-paper">
        <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} data-testid="success-icon" />
        <Typography variant="h4" gutterBottom data-testid="success-heading">
          Бронирование успешно!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Мы отправили подтверждение на вашу почту.
        </Typography>
        <Button variant="contained" component={Link} to="/" data-testid="go-home-button">
          На главную
        </Button>
      </Paper>
    </PublicLayout>
  )
}
