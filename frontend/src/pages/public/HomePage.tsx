import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardActions, Typography, Grid, Button } from '@mui/material'
import { PublicLayout } from '../../components/PublicLayout'
import { eventTypesApi } from '../../api/client'
import type { EventType } from '../../api/types'

export const HomePage = () => {
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    eventTypesApi.list().then(setEventTypes).catch(console.error)
  }, [])

  return (
    <PublicLayout>
      <Typography variant="h4" gutterBottom>
        Выберите тип события
      </Typography>
      <Grid container spacing={3}>
        {eventTypes.map((et) => (
          <Grid item xs={12} sm={6} md={4} key={et.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {et.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {et.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => navigate(`/slots?eventTypeId=${et.id}`)}
                >
                  Выбрать
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </PublicLayout>
  )
}
