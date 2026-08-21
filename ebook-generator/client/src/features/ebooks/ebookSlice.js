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
      const ebook = await ebookApi.approveSpecification(ebookId);

      console.log("APPROVE THUNK EBOOK:", ebook);

      return ebook;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to approve specification.",
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
      const ebook = await ebookApi.approveOutline(ebookId);

      return ebook;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Unable to approve outline.",
      );
    }
  },
);

export const generateChapters = createAsyncThunk(
  "ebooks/generateChapters",
  async (ebookId, thunkAPI) => {
    try {
      const ebook = await ebookApi.generateChapters(ebookId);

      return ebook;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Unable to generate chapters.",
      );
    }
  },
);

export const approveChapters = createAsyncThunk(
  "ebooks/approveChapters",
  async (ebookId, thunkAPI) => {
    try {
      const ebook = await ebookApi.approveChapters(ebookId);

      return ebook;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Unable to approve chapters.",
      );
    }
  },
);

export const generateImagePlan = createAsyncThunk(
  "ebooks/generateImagePlan",
  async (ebookId, thunkAPI) => {
    try {
      const ebook = await ebookApi.generateImagePlan(ebookId);

      return ebook;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Unable to generate image plan.",
      );
    }
  },
);

export const approveImagePlan = createAsyncThunk(
  "ebooks/approveImagePlan",
  async (ebookId, thunkAPI) => {
    try {
      const ebook = await ebookApi.approveImagePlan(ebookId);

      return ebook;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Unable to approve image plan.",
      );
    }
  },
);

export const generateImages = createAsyncThunk(
  "ebooks/generateImages",
  async (ebookId, thunkAPI) => {
    try {
      return await ebookApi.generateImages(ebookId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Unable to generate images.",
      );
    }
  },
);

export const approveImages = createAsyncThunk(
  "ebooks/approveImages",
  async (ebookId, thunkAPI) => {
    try {
      return await ebookApi.approveImages(ebookId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Unable to approve images.",
      );
    }
  },
);

export const generateCover = createAsyncThunk(
  "ebooks/generateCover",
  async (ebookId, thunkAPI) => {
    try {
      const ebook = await ebookApi.generateCover(ebookId);

      console.log("GENERATE COVER THUNK EBOOK:", ebook);

      return ebook;
    } catch (error) {
      console.error("GENERATE COVER THUNK ERROR:", error);

      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Unable to generate cover.",
      );
    }
  },
);

export const approveCover = createAsyncThunk(
  "ebooks/approveCover",
  async (ebookId, thunkAPI) => {
    try {
      return await ebookApi.approveCover(ebookId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Unable to approve cover.",
      );
    }
  },
);

export const generateAssembly = createAsyncThunk(
  "ebooks/generateAssembly",
  async (ebookId, thunkAPI) => {
    try {
      const ebook = await ebookApi.generateAssembly(ebookId);

      console.log("GENERATE ASSEMBLY EBOOK:", ebook);

      return ebook;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Unable to assemble ebook.",
      );
    }
  },
);

export const approveAssembly = createAsyncThunk(
  "ebooks/approveAssembly",
  async (ebookId, thunkAPI) => {
    try {
      const ebook = await ebookApi.approveAssembly(ebookId);

      console.log("APPROVE ASSEMBLY EBOOK:", ebook);

      return ebook;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Unable to approve ebook assembly.",
      );
    }
  },
);

export const exportPdf = createAsyncThunk(
  "ebooks/exportPdf",
  async (ebookId, thunkAPI) => {
    try {
      const ebook = await ebookApi.exportPdf(ebookId);

      return ebook;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Unable to export PDF.",
      );
    }
  },
);

export const exportEpub = createAsyncThunk(
  "ebooks/exportEpub",
  async (ebookId, thunkAPI) => {
    try {
      const ebook = await ebookApi.exportEpub(ebookId);

      return ebook;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Unable to export EPUB.",
      );
    }
  },
);

export const getExportStatus = createAsyncThunk(
  "ebooks/getExportStatus",
  async (ebookId, thunkAPI) => {
    try {
      const ebook = await ebookApi.getExportStatus(ebookId);

      return ebook;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Unable to get export status.",
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

      // ApproveSpecification

      .addCase(approveSpecification.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })

      .addCase(approveSpecification.fulfilled, (state, action) => {
        state.operationLoading = false;

        const ebook = action.payload;

        if (!ebook) {
          state.error = "Specification approval returned no ebook.";
          return;
        }

        state.current = ebook;

        const index = state.items.findIndex((item) => item._id === ebook._id);

        if (index !== -1) {
          state.items[index] = ebook;
        }
      })

      .addCase(approveSpecification.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
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
      })

      // Chapter

      .addCase(generateChapters.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })

      .addCase(generateChapters.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.current = action.payload;

        const index = state.items.findIndex(
          (item) => item._id === action.payload._id,
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      .addCase(generateChapters.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })

      .addCase(approveChapters.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })

      .addCase(approveChapters.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.current = action.payload;

        const index = state.items.findIndex(
          (item) => item._id === action.payload._id,
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      .addCase(approveChapters.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })

      // Image

      .addCase(generateImagePlan.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })

      .addCase(generateImagePlan.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.current = action.payload;

        const index = state.items.findIndex(
          (item) => item._id === action.payload._id,
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      .addCase(generateImagePlan.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })

      .addCase(approveImagePlan.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })

      .addCase(approveImagePlan.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.current = action.payload;

        const index = state.items.findIndex(
          (item) => item._id === action.payload._id,
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      .addCase(approveImagePlan.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })

      // Image cover
      .addCase(generateCover.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })

      .addCase(generateCover.fulfilled, (state, action) => {
        state.operationLoading = false;

        console.log("GENERATE COVER REDUCER:", action.payload);

        state.current = action.payload;

        /*
         * Also keep the list synchronized.
         */
        const index = state.items.findIndex(
          (item) => item._id === action.payload._id,
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      .addCase(generateCover.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })

      .addCase(approveCover.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })

      .addCase(approveCover.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.current = action.payload;

        const index = state.items.findIndex(
          (item) => item._id === action.payload._id,
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      .addCase(approveCover.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })

      //assembly
      .addCase(generateAssembly.fulfilled, (state, action) => {
        state.currentEbook = action.payload;

        const index = state.items.findIndex(
          (ebook) => ebook._id === action.payload._id,
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      .addCase(approveAssembly.fulfilled, (state, action) => {
        state.currentEbook = action.payload;

        const index = state.items.findIndex(
          (ebook) => ebook._id === action.payload._id,
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      // export pdf
      .addCase(exportPdf.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportPdf.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEbook = action.payload;
        state.error = null;

        if (Array.isArray(state.ebooks)) {
          const index = state.ebooks.findIndex(
            (ebook) => ebook._id === action.payload._id,
          );

          if (index !== -1) {
            state.ebooks[index] = action.payload;
          }
        }
      })
      .addCase(exportPdf.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //epub

      .addCase(exportEpub.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportEpub.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEbook = action.payload;
        state.error = null;

        if (Array.isArray(state.ebooks)) {
          const index = state.ebooks.findIndex(
            (ebook) => ebook._id === action.payload._id,
          );

          if (index !== -1) {
            state.ebooks[index] = action.payload;
          }
        }
      })
      .addCase(exportEpub.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // status
      .addCase(getExportStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(getExportStatus.fulfilled, (state, action) => {
        state.currentEbook = action.payload;
        state.error = null;

        if (Array.isArray(state.ebooks)) {
          const index = state.ebooks.findIndex(
            (ebook) => ebook._id === action.payload._id,
          );

          if (index !== -1) {
            state.ebooks[index] = action.payload;
          }
        }
      })
      .addCase(getExportStatus.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearEbookError, setCurrentEbook } = ebookSlice.actions;

export default ebookSlice.reducer;
