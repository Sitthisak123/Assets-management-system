import apiClient from './apiClient';

// --- Interfaces (Matches your Prisma Schema & Controller) ---

export interface UserSubset {
  id: number;
  fullname: string;
  username: string;
  email: string;
  position: string;
  title: string;
}

export interface RequisitionItem {
  id: number;
  material_id: number;
  quantity: number;
  material?: {
    id: number;
    title: string;
    unit: string;
  };
}

export interface Requisition {
  id: number;
  ref_no: string;
  subject: string;
  description?: string;
  purpose?: string;
  status: number; // -1: Rejected, 0: Pending, 1: Approved
  form_date: string;
  created_at: string;
  updated_at: string;
  creator: UserSubset;
  owner: UserSubset;
  authorizer?: UserSubset | null;
  mr_form_materials: RequisitionItem[];
}

// --- Service Methods ---

const getRequisitions = () => {
  return apiClient.get<Requisition[]>('/requisitions');
};

const getRequisitionById = (id: number) => {
  return apiClient.get<Requisition>(`/requisitions/${id}`);
};

const createRequisition = (data: Partial<Requisition> & { items: any[] }) => {
  return apiClient.post<Requisition>('/requisitions', data);
};

const updateRequisition = (id: number, data: Partial<Requisition> & { items?: any[] }) => {
  return apiClient.put<Requisition>(`/requisitions/${id}`, data);
};

const deleteRequisition = (id: number) => {
  return apiClient.delete(`/requisitions/${id}`);
};

export const requisitionService = {
  getRequisitions,
  getRequisitionById,
  createRequisition,
  updateRequisition,
  deleteRequisition,
};