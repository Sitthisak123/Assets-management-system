import apiClient from './apiClient';

export interface MaterialType {
  id: number;
  title: string;
}

export interface Material {
  id: number;
  title: string;
  material_type_id: number;
  unit: string;
  quantity: number;
  price: number; // Added price
  safety_stock?: number;
  created_at: string;
  updated_at: string;
  material_type?: MaterialType;
}

const getAll = (): Promise<Material[]> => {
  // Simulate fetching all materials
  return Promise.resolve([
    // Add sample data that matches the Material interface
    { id: 1, title: 'Material 1', material_type_id: 1, unit: 'pcs', quantity: 100, price: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 2, title: 'Material 2', material_type_id: 2, unit: 'pcs', quantity: 50, price: 25, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 3, title: 'Material 3', material_type_id: 1, unit: 'pcs', quantity: 200, price: 5, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), safety_stock: 50 },
  ]);
};

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f97316', '#ef4444', '#989ca1'];

const getInventoryDistribution = (): Promise<any[]> => {
  return apiClient.get('/materials/distribution').then(response => {
    if (response.data.mappedCount && Array.isArray(response.data.mappedCount)) {
      const distributionData = [...response.data.mappedCount].sort((a, b) => b.count - a.count);

      let processedData;
      if (distributionData.length > 6) {
        const top5 = distributionData.slice(0, 5);
        const otherValue = distributionData.slice(5).reduce((acc, item) => acc + item.count, 0);
        processedData = [
          ...top5,
          { material_type: 'Other', count: otherValue },
        ];
      } else {
        processedData = distributionData;
      }

      return processedData.map((item: any, index: number) => ({
        name: item.material_type,
        value: item.count,
        color: COLORS[index % COLORS.length],
      }));
    }
    return [];
  });
};

const getInventoryValue = (): Promise<number> => { // awaiting real API implementation
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(45200);
    }, 500);
  });
};

const getMaterials = () => {
  return apiClient.get('/materials');
};
const getMaterialById = (id: string) => {
  return apiClient.get(`/materials/${id}`);
};
const createMaterial = (data: any) => {
  return apiClient.post('/materials', data);
};
const updateMaterial = (id: string, data: any) => {
  return apiClient.put(`/materials/${id}`, data);
};
const deleteMaterial = (id: string) => {
  return apiClient.delete(`/materials/${id}`);
};

export const materialService = {
  getAll,
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getInventoryValue,
  getInventoryDistribution,
};
