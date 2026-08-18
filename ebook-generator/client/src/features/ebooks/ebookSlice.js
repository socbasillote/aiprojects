import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import ebookApi from "./ebookApi.js";

const initialState = {
  items: [],
  current: null,
  loading: false,
  operationLoading: false,
  error: null,
};

export const fetchEbooks = createAsyncThunk(
  "ebooks/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await ebookApi.getEbooks();

      return response.data.ebooks;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Unable to load ebooks.",
      );
    }
  },
);

export const fetchEbook = createAsyncThunk(
  "ebooks/fetchOne",
  async (ebookId, thunkAPI) => {
    try {
      const response = await ebookApi.getEbook(ebookId);

      return response.data.ebook;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Unable to load ebook.",
      );
    }
  },
);

export const createEbook = createAsyncThunk(
  "ebooks/create",
  async (data, thunkAPI) => {
    try {
      const response = await ebookApi.createEbook(data);

      return response.data.ebook;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Unable to create ebook.",
      );
    }
  },
);

export const deleteEbook = createAsyncThunk(
  "ebooks/delete",
  async (ebookId, thunkAPI) => {
    try {
      await ebookApi.deleteEbook(ebookId);

      return ebookId;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Unable to delete ebook.",
      );
    }
  },
);

export const generateSpecification = createAsyncThunk(
  "ebooks/generateSpecification",
  async (ebookId, thunkAPI) => {
    try {
      const response = await ebookApi.generateSpecification(ebookId);

      return response.data.ebook;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Unable to generate specification.",
      );
    }
  },
);

export const updateSpecification = createAsyncThunk(
  "ebooks/updateSpecification",
  async ({ ebookId, specification }, thunkAPI) => {
    try {
      const response = await ebookApi.updateSpecification(
        ebookId,
        specification,
      );

      return response.data.ebook;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Unable to update specification.",
      );
    }
  },
);

export const approveSpecification = createAsyncThunk(
  "ebooks/approveSpecification",
  async (ebookId, thunkAPI) => {
    try {
      const response = await ebookApi.approveSpecification(ebookId);

      return response.data.ebook;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Unable to approve specification.",
      );
    }
  },
);

export const generateOutline = createAsyncThunk(
  "ebooks/generateOutline",
  async (ebookId, thunkAPI) => {
    try {
      const response = await ebookApi.generateOutline(ebookId);

      return response.data.ebook;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Unable to generate outline.",
      );
    }
  },
);

export const updateOutline = createAsyncThunk(
  "ebooks/updateOutline",
  async ({ ebookId, outline }, thunkAPI) => {
    try {
      const response = await ebookApi.updateOutline(ebookId, outline);

      return response.data.ebook;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Unable to update outline.",
      );
    }
  },
);

export const approveOutline = createAsyncThunk(
  "ebooks/approveOutline",
  async (ebookId, thunkAPI) => {
    try {
      const response = await ebookApi.approveOutline(ebookId);

      return response.data.ebook;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Unable to approve outline.",
      );
    }
  },
);

const ebookSlice = createSlice({
  name: "ebooks",

  initialState,

  reducers: {
    clearEbookError: (state) => {
      state.error = null;
    },

    setCurrentEbook: (state, action) => {
      state.current = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchEbooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchEbooks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })

      .addCase(fetchEbooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchEbook.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchEbook.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })

      .addCase(fetchEbook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createEbook.fulfilled, (state, action) => {
        state.items.unshift(action.payload);

        state.current = action.payload;
      })

      .addCase(deleteEbook.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (ebook) => ebook._id !== action.payload,
        );

        if (state.current?._id === action.payload) {
          state.current = null;
        }
      })

      .addCase(generateSpecification.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })

      .addCase(generateSpecification.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.current = action.payload;
      })

      .addCase(generateSpecification.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })

      .addCase(updateSpecification.fulfilled, (state, action) => {
        state.current = action.payload;
      })

      .addCase(approveSpecification.fulfilled, (state, action) => {
        state.current = action.payload;
      })

      .addCase(generateOutline.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })

      .addCase(generateOutline.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.current = action.payload;
      })

      .addCase(generateOutline.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })

      .addCase(updateOutline.fulfilled, (state, action) => {
        state.current = action.payload;
      })

      .addCase(approveOutline.fulfilled, (state, action) => {
        state.current = action.payload;
      });
  },
});

export const { clearEbookError, setCurrentEbook } = ebookSlice.actions;

export default ebookSlice.reducer;
