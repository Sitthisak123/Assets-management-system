
export type Status = 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'On Leave' | 'Terminated' | 'In Stock' | 'Out of Stock' | 'Low Stock';

export interface Requisition {
  id: string;
  dateCreated: string;
  requester: {
    name: string;
    avatar: string;
  };
  item: string;
  department: string;
  itemsCount?: number;
  totalCost: string;
  status: Status;
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  email: string;
  phone: string;
  role: string;
  type: string;
  status: Status;
  avatar: string;
}

export interface Material {
  sku: string;
  name: string;
  category: string;
  qty: string;
  unitPrice: string;
  status: Status;
}
