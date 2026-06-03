import simpleRestProvider from 'ra-data-simple-rest'
import type { DataProvider } from 'react-admin'

export const dataProvider: DataProvider = simpleRestProvider('/api')
