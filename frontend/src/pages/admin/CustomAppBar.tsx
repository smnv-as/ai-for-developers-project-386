import { AppBar } from 'react-admin'
import { Button } from '@mui/material'
import { Link } from 'react-router-dom'

const ExitButton = () => (
  <Button
    color="inherit"
    component={Link}
    to="/"
    sx={{ textTransform: 'none' }}
  >
    Выйти в пользовательский режим
  </Button>
)

export const CustomAppBar = () => <AppBar toolbar={<ExitButton />} />
