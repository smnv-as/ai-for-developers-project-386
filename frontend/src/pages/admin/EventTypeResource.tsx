import { List, Create, Edit, Show, Datagrid, TextField, SimpleForm, TextInput, required, EditButton, DeleteButton } from 'react-admin'
import { Button } from '@mui/material'
import { Link } from 'react-router-dom'

export const EventTypeList = () => (
  <List actions={<Button component={Link} to="/admin/event-types/create" role="button">Create</Button>}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="name" label="Название" />
      <TextField source="description" label="Описание" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
)

export const EventTypeCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" label="Название" validate={[required()]} />
      <TextInput
        source="description"
        label="Описание"
        multiline
        rows={3}
        validate={[required()]}
      />
    </SimpleForm>
  </Create>
)

export const EventTypeEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" label="Название" validate={[required()]} />
      <TextInput
        source="description"
        label="Описание"
        multiline
        rows={3}
        validate={[required()]}
      />
    </SimpleForm>
  </Edit>
)

export const EventTypeShow = () => (
  <Show>
    <SimpleForm>
      <TextField source="id" />
      <TextField source="name" label="Название" />
      <TextField source="description" label="Описание" />
    </SimpleForm>
  </Show>
)
