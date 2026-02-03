export interface Profile {
  id: number;
  username: string;
  title: string;
  role: number;
  status: number;
  personnel_id: number;
  created_at: string;
  updated_at: string;
  email: string;
}

export interface Personnel {
  id: number;
  fullname: string;
  position: string;
  users?: Profile[] | null;
}

export interface MaterialType {
  id: number;
  title: string;
}

export interface Material {
  id: number;
  title: string;
  material_type_id: number;
  quantity: number;
  unit: string;
  created_at: string;
  updated_at: string;
  material_type: MaterialType;
}

export interface MrFormMaterial {
  id: number;
  mr_form_id: number;
  material_id: number;
  quantity: number;
  material: Material;
}

export interface MrForm {
  id: number;
  subject: string;
  ref_no: string;
  description: string | null;
  purpose: string | null;
  status: number;
  form_date: string;
  created_at: string;
  updated_at: string;
  creator_id: number;
  owner_id: number;
  authorizer_id: number | null;
  creator: Profile;
  owner: Personnel;
  authorizer?: Profile | null;
  mr_form_materials: MrFormMaterial[];
}