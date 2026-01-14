import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Material = {
  id: number | string;
  title: string;
  material_type_id?: string | number;
  quantity?: number;
  unit?: string;
};

interface AssetsState {
  materials: Material[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: AssetsState = {
  materials: [],
  status: 'idle',
};

const assetsSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {
    setMaterials(state, action: PayloadAction<Material[]>) {
      state.materials = action.payload;
    },
    addMaterial(state, action: PayloadAction<Material>) {
      state.materials.push(action.payload);
    },
    updateMaterial(state, action: PayloadAction<Material>) {
      const idx = state.materials.findIndex((m) => m.id === action.payload.id);
      if (idx >= 0) state.materials[idx] = action.payload;
    },
    removeMaterial(state, action: PayloadAction<number | string>) {
      state.materials = state.materials.filter((m) => m.id !== action.payload);
    },
    setStatus(state, action: PayloadAction<AssetsState['status']>) {
      state.status = action.payload;
    },
  },
});

export const { setMaterials, addMaterial, updateMaterial, removeMaterial, setStatus } = assetsSlice.actions;
export default assetsSlice.reducer;
