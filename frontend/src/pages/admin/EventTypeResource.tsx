import {
  List,
  Create,
  Edit,
  Show,
  Delete,
  Datagrid,
  TextField,
  SimpleForm,
  TextInput,
  required,
  DeleteButton,
  RecordContextProvider,
} from 'react-admin'

export const EventTypeList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <TextField source="name" label="Название" />
      <TextField source="description" label="Описание" />
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
