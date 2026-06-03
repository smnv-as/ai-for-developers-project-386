import { Layout, type LayoutProps } from 'react-admin'
import { CustomAppBar } from './CustomAppBar'

export const CustomLayout = (props: LayoutProps) => (
  <Layout {...props} appBar={CustomAppBar} />
)
