import { Component, type ReactNode } from 'react'
import { Paper, Typography, Button } from '@mui/material'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Что-то пошло не так
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {this.state.error?.message || 'Произошла непредвиденная ошибка'}
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Обновить страницу
          </Button>
        </Paper>
      )
    }

    return this.props.children
  }
}
