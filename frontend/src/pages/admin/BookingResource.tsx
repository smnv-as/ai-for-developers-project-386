import {
  List,
  Datagrid,
  TextField,
  DateField,
} from 'react-admin'

export const BookingList = () => (
  <List>
    <Datagrid>
      <TextField source="id" label="ID" />
      <TextField source="eventTypeId" label="Тип события" />
      <DateField source="startTime" label="Начало" showDate />
      <DateField source="endTime" label="Конец" showDate />
      <TextField source="guestName" label="Гость" />
      <TextField source="guestEmail" label="Email" />
    </Datagrid>
  </List>
)
