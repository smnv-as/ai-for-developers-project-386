import type { ReactNode } from 'react'
import { AppBar, Toolbar, Typography, Container, Box, Button } from '@mui/material'
import { Link } from 'react-router-dom'

interface PublicLayoutProps {
  children: ReactNode
}

export const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }} data-testid="app-title">
            Система бронирования
          </Typography>
          <Button color="inherit" component={Link} to="/admin" data-testid="admin-link">
            Админка
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: 4 }} data-testid="main-content">
        {children}
      </Container>
    </Box>
  )
}
