import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Typography, Button, Box, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { PublicLayout } from '../../components/PublicLayout'
import { slotsApi } from '../../api/client'
import type { Slot } from '../../api/types'

interface GroupedSlots {
  date: string
  slots: Slot[]
}

function groupSlotsByDate(slots: Slot[]): GroupedSlots[] {
  const groups: Record<string, Slot[]> = {}
  slots.forEach((slot) => {
    const date = slot.startTime.split('T')[0]
    if (!groups[date]) groups[date] = []
    groups[date].push(slot)
  })
  return Object.entries(groups).map(([date, slots]) => ({ date, slots }))
}

function formatTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

export const SlotsPage = () => {
  const [searchParams] = useSearchParams()
  const eventTypeId = searchParams.get('eventTypeId') ?? ''
  const [groupedSlots, setGroupedSlots] = useState<GroupedSlots[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    if (eventTypeId) {
      slotsApi.list({ eventTypeId }).then((slots) => {
        setGroupedSlots(groupSlotsByDate(slots))
      }).catch(console.error)
    }
  }, [eventTypeId])

  return (
    <PublicLayout>
      <Typography variant="h4" gutterBottom data-testid="slots-page-heading">
        Доступные слоты
      </Typography>
      {groupedSlots.length === 0 ? (
        <Typography color="text.secondary" data-testid="no-slots-message">Нет доступных слотов</Typography>
      ) : (
        <Box sx={{ mt: 2 }} data-testid="slots-list">
          {groupedSlots.map(({ date, slots }) => (
            <Accordion key={date} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{new Date(date).toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {slots.map((slot) => (
                    <ListItem
                      key={slot.startTime}
                      data-testid={`slot-item-${slot.startTime.replace(/[:.]/g, '-')}`}
                      secondaryAction={
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() =>
                            navigate(`/booking?eventTypeId=${eventTypeId}&startTime=${slot.startTime}`)
                          }
                          data-testid={`book-slot-button-${slot.startTime.replace(/[:.]/g, '-')}`}
                        >
                          Забронировать
                        </Button>
                      }
                    >
                      <ListItemText
                        primary={formatTime(slot.startTime)}
                        secondary={`— ${formatTime(slot.endTime)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </PublicLayout>
  )
}
