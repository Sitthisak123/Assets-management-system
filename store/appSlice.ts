import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  appName: string;
  theme: 'light' | 'dark';
  dbRef: string;
  lastUpdated?: string;
}

const initialDBRef = `// Use DBML to define your database structure
// Docs: https://dbml.dbdiagram.io/docs

Table users {
  id integer [primary key]
  username varchar [not null]
  hash_pwd varchar [not null]
  title varchar [not null]
  role byte [not null]
  status byte [not null]
  created_at timestamp [not null]
  update_at timestamp [not null]
  email varchar [not null]
  personel_id int [not null] //auto create personnel on User creating with position required if not exist.
  Note: 
  '''
    role:
    0=user
    1=admin

    status:
    -1= suspend
    0 = Unauthorize
    1 = Activated
    2 = ?
  '''
}

Table mr_form {
  id integer [primary key] 
  descripts varchar
  authorizer_id integer [not null]
  materials integer
  creator_id integer [not null]
  created_at timestamp [not null]
  update_at timestamp [not null]
  date datetime [not null]
  subject varchar [not null]
  ref_no varchar [not null] //notfixe 
  owner integer [not null] 
  owing_to varchar //Description
            


}

table porsonel {
  id integer [primary key]
  fullname varchar [not null]
  position varchar [not null]

}

Table material {
  id integer [primary key]
  title varchar [not null]
  material_type_id varchar [not null]
  quantity integer [not null]
  unit varchar [not null]
  created_at timestamp
  updated_at timestamp [not null]
}

Table material_type {
  id integer [primary key]
  title varchar [not null]
  created_at timestamp [not null]
  updated_at timestamp [not null]
}

Table mr_form_materials {
  id integer [primary key]
  mr_form_id integer [not null]
  material_id integer [not null]
  quantity integer [not null]
  Note: 
  '''Materials included in the MR form with requested quantity'''
}

Ref mr_form_authorizer: mr_form.authorizer_id > users.id // many-to-one
          
Ref user_mr_form: mr_form.creator_id > users.id // many-to-one
Ref material_type_link: material.material_type_id > material_type.id
Ref mr_form_owner_link: mr_form.owner > porsonel.id

Ref: "mr_form"."materials" < "mr_form_materials"."id"
Ref: "mr_form"."id" < "mr_form_materials"."mr_form_id"
Ref: "mr_form_materials"."material_id" > "material"."id"

Ref: "users"."personel_id" - "porsonel"."id"`;

const initialState: AppState = { appName: 'Internal Management', theme: 'light', dbRef: initialDBRef };

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<AppState['theme']>) {
      state.theme = action.payload;
    },
    setAppName(state, action: PayloadAction<string>) {
      state.appName = action.payload;
    },
    setDbRef(state, action: PayloadAction<string>) {
      state.dbRef = action.payload;
    },
  },
});

export const { setTheme, setAppName, setDbRef } = appSlice.actions;
export default appSlice.reducer;
