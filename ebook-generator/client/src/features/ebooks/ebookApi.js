import api from "../../services/api.js";

const createEbook = async (data) => {
  const response = await api.post("/ebooks", data);

  return response.data;
};

const getEbooks = async () => {
  const response = await api.get("/ebooks");

  return response.data;
};

const getEbook = async (ebookId) => {
  const response = await api.get(`/ebooks/${ebookId}`);

  return response.data;
};

const updateEbook = async (ebookId, data) => {
  const response = await api.patch(`/ebooks/${ebookId}`, data);

  return response.data;
};

const deleteEbook = async (ebookId) => {
  const response = await api.delete(`/ebooks/${ebookId}`);

  return response.data;
};

const generateSpecification = async (ebookId) => {
  const response = await api.post(`/ebooks/${ebookId}/specification`);

  return response.data;
};

const updateSpecification = async (ebookId, specification) => {
  const response = await api.patch(
    `/ebooks/${ebookId}/specification`,
    specification,
  );

  return response.data;
};

const approveSpecification = async (ebookId) => {
  const response = await api.post(`/ebooks/${ebookId}/specification/approve`);

  console.log("APPROVE API RAW RESPONSE:", response);

  console.log("APPROVE API DATA:", response.data);

  console.log("APPROVE API EBOOK:", response.data?.data?.ebook);

  return response.data?.data?.ebook;
};

const generateOutline = async (ebookId) => {
  const response = await api.post(`/ebooks/${ebookId}/outline`);

  return response.data;
};

const updateOutline = async (ebookId, outline) => {
  const response = await api.patch(`/ebooks/${ebookId}/outline`, outline);

  return response.data;
};

const approveOutline = async (ebookId) => {
  const response = await api.post(`/ebooks/${ebookId}/outline/approve`);

  return response.data.data.ebook;
};

const addOutlineChapter = async (ebookId, chapter) => {
  const response = await api.post(
    `/ebooks/${ebookId}/outline/chapters`,
    chapter,
  );

  return response.data;
};

const updateOutlineChapter = async (ebookId, chapterNumber, chapter) => {
  const response = await api.patch(
    `/ebooks/${ebookId}/outline/chapters/${chapterNumber}`,
    chapter,
  );

  return response.data;
};

const deleteOutlineChapter = async (ebookId, chapterNumber) => {
  const response = await api.delete(
    `/ebooks/${ebookId}/outline/chapters/${chapterNumber}`,
  );

  return response.data;
};

const reorderOutlineChapters = async (ebookId, chapterOrder) => {
  const response = await api.patch(`/ebooks/${ebookId}/outline/reorder`, {
    chapterOrder,
  });

  return response.data;
};

const generateChapters = async (ebookId) => {
  const response = await api.post(`/ebooks/${ebookId}/chapters`);

  return response.data.data.ebook;
};

const approveChapters = async (ebookId) => {
  const response = await api.post(`/ebooks/${ebookId}/chapters/approve`);

  return response.data.data.ebook;
};

const generateImagePlan = async (ebookId) => {
  const response = await api.post(`/ebooks/${ebookId}/images`);

  return response.data.data.ebook;
};

const approveImagePlan = async (ebookId) => {
  const response = await api.post(`/ebooks/${ebookId}/images/approve`);

  return response.data.data.ebook;
};

const generateImages = async (ebookId) => {
  const response = await api.post(`/ebooks/${ebookId}/images/generate`);

  return response.data.data.ebook;
};

const approveImages = async (ebookId) => {
  const response = await api.post(`/ebooks/${ebookId}/images/finalize`);

  return response.data.data.ebook;
};

export default {
  createEbook,
  getEbooks,
  getEbook,
  updateEbook,
  deleteEbook,

  generateSpecification,
  updateSpecification,
  approveSpecification,

  generateOutline,
  updateOutline,
  approveOutline,

  addOutlineChapter,
  updateOutlineChapter,
  deleteOutlineChapter,
  reorderOutlineChapters,

  generateChapters,
  approveChapters,

  generateImagePlan,
  approveImagePlan,

  generateImages,
  approveImages,
};
