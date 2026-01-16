export interface Profile {
  id: string; // uuid
  username: string | null;
  title: string | null;
  role: number;
  status: number;
  personnel_id: number | null;
  created_at: string;
  updated_at: string;
  email?: string;
  avatar_url?: string;
}

export interface Personnel {
  id: number;
  fullname: string;
  position: string;
  created_at: string;
  profiles: Profile | null;
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
}

export interface MrForm {
  id: number;
  subject: string;
  ref_no: string;
  description: string | null;
  date: string;
  owing_to: string | null;
  creator_id: string;
  authorizer_id: string | null;
  owner_personnel_id: number;
  created_at: string;
  updated_at: string;
  creator: Profile;
  owner: Personnel;
  mr_form_materials: { count: number }[];
}