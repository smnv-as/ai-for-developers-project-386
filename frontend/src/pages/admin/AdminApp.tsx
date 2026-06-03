import { Admin, Resource } from 'react-admin'
import { dataProvider } from './dataProvider'
import polyglotI18nProvider from 'ra-i18n-polyglot'
import { englishMessages } from 'ra-language-english'
import customMessages from '../../i18n/ru'
import { EventTypeList, EventTypeCreate, EventTypeEdit, EventTypeShow } from './EventTypeResource'
import { BookingList } from './BookingResource'

const i18nProvider = polyglotI18nProvider(
  (locale) => (locale === 'ru' ? customMessages : englishMessages),
  'ru',
)

export const AdminApp = () => (
  <Admin dataProvider={dataProvider} i18nProvider={i18nProvider}>
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
