import { Admin, Resource } from 'react-admin'
import simpleRestProvider from 'ra-data-simple-rest'
import { EventTypeList, EventTypeCreate, EventTypeEdit, EventTypeShow } from './EventTypeResource'
import { BookingList } from './BookingResource'

export const AdminApp = () => (
  <Admin dataProvider={simpleRestProvider('/api')}>
    <Resource
      name="event-types"
      list={EventTypeList}
      create={EventTypeCreate}
      edit={EventTypeEdit}
      show={EventTypeShow}
    />
    <Resource name="bookings" list={BookingList} />
  </Admin>
)
