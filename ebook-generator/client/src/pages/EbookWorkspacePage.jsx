import { lazy, Suspense, useEffect, useState } from "react";

import { useParams, Link } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import { ArrowLeft, Loader2 } from "lucide-react";

import {
  fetchEbook,
  generateSpecification,
  updateSpecification,
  approveSpecification,
  generateOutline,
  updateOutline,
  approveOutline,
  generateChapters,
  approveChapters,
  generateImagePlan,
  approveImagePlan,
  generateImages,
  approveImages,
  generateCover,
  approveCover,
  generateAssembly,
  approveAssembly,
  exportPdf,
  exportEpub,
  setCurrentEbook,
} from "../features/ebooks/ebookSlice.js";

import { toast } from "sonner";

import EbookWorkspaceSidebar from "../components/EbookWorkspaceSidebar.jsx";

import Overview from "../components/ebook/Overview.jsx";

import SpecificationEditor from "../components/ebook/editors/SpecificationEditor.jsx";

import OutlineEditor from "../components/ebook/editors/OutlineEditor.jsx";

/*
 * Lazy-loaded editors.
 *
 * These components are only downloaded when
 * the corresponding workspace section is rendered.
 */
const ChaptersEditor = lazy(
  () => import("../components/ebook/editors/ChaptersEditor.jsx"),
);

const ImagesEditor = lazy(
  () => import("../components/ebook/editors/ImagesEditor.jsx"),
);

const CoverEditor = lazy(
  () => import("../components/ebook/editors/CoverEditor.jsx"),
);

const AssemblyEditor = lazy(
  () => import("../components/ebook/editors/AssemblyEditor.jsx"),
);

const ExportEditor = lazy(
  () => import("../components/ebook/editors/ExportEditor.jsx"),
);

/*
 * Loading UI displayed while a lazy editor
 * is being downloaded.
 */
const EditorLoading = () => {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Loader2 size={18} className="animate-spin" />
        Loading editor...
      </div>
    </div>
  );
};

const EbookWorkspacePage = () => {
  const { id } = useParams();

  const dispatch = useDispatch();

  const {
    current: ebook,
    loading,
    operationLoading,
    error,
  } = useSelector((state) => state.ebooks);

  const [activeTab, setActiveTab] = useState("overview");

  const [specification, setSpecification] = useState(null);

  const [outline, setOutline] = useState(null);

  /*
   * Fetch ebook.
   */
  useEffect(() => {
    dispatch(fetchEbook(id));
  }, [dispatch, id]);

  /*
   * Synchronize editable local state
   * with the currently loaded ebook.
   */
  useEffect(() => {
    if (ebook?.specification) {
      setSpecification(ebook.specification);
    }

    if (ebook?.outline) {
      setOutline(ebook.outline);
    }
  }, [ebook]);

  /*
   * Display Redux errors.
   */
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  /*
   * Initial loading state.
   */
  if (loading && !ebook) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  /*
   * Ebook not found.
   */
  if (!ebook) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>
          <h1 className="font-semibold">Ebook not found</h1>

          <Link to="/" className="mt-3 inline-block text-sm underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  /*
   * --------------------------------------------------
   * Specification
   * --------------------------------------------------
   */

  const handleGenerateSpecification = async () => {
    const result = await dispatch(generateSpecification(id));

    if (generateSpecification.fulfilled.match(result)) {
      toast.success("Specification generated.");

      setActiveTab("specification");
    }
  };

  const handleSaveSpecification = async () => {
    const result = await dispatch(
      updateSpecification({
        ebookId: id,
        specification,
      }),
    );

    if (updateSpecification.fulfilled.match(result)) {
      toast.success("Specification saved.");
    }
  };

  const handleApproveSpecification = async () => {
    const result = await dispatch(approveSpecification(id));

    if (approveSpecification.fulfilled.match(result)) {
      const approvedEbook = result.payload;

      dispatch(setCurrentEbook(approvedEbook));

      toast.success("Specification approved.");

      setActiveTab("outline");
    }
  };

  /*
   * --------------------------------------------------
   * Outline
   * --------------------------------------------------
   */

  const handleGenerateOutline = async () => {
    const result = await dispatch(generateOutline(id));

    if (generateOutline.fulfilled.match(result)) {
      toast.success("Outline generated.");

      setActiveTab("outline");
    }
  };

  const handleSaveOutline = async () => {
    const result = await dispatch(
      updateOutline({
        ebookId: id,
        outline,
      }),
    );

    if (updateOutline.fulfilled.match(result)) {
      toast.success("Outline saved.");
    }
  };

  const handleApproveOutline = async () => {
    const result = await dispatch(approveOutline(id));

    if (approveOutline.fulfilled.match(result)) {
      const approvedEbook = result.payload;

      dispatch(setCurrentEbook(approvedEbook));

      toast.success("Outline approved.");

      setActiveTab("chapters");
    }
  };

  /*
   * --------------------------------------------------
   * Chapters
   * --------------------------------------------------
   */

  const handleGenerateChapters = async () => {
    const result = await dispatch(generateChapters(id));

    if (generateChapters.fulfilled.match(result)) {
      toast.success("Chapters generated successfully.");
    }
  };

  const handleApproveChapters = async () => {
    const result = await dispatch(approveChapters(id));

    if (approveChapters.fulfilled.match(result)) {
      const approvedEbook = result.payload;

      dispatch(setCurrentEbook(approvedEbook));

      toast.success("Chapters approved.");

      setActiveTab("images");
    }
  };

  /*
   * --------------------------------------------------
   * Images
   * --------------------------------------------------
   */

  const handleGenerateImagePlan = async () => {
    const result = await dispatch(generateImagePlan(id));

    if (generateImagePlan.fulfilled.match(result)) {
      toast.success("Image plan generated.");
    }
  };

  const handleApproveImagePlan = async () => {
    const result = await dispatch(approveImagePlan(id));

    if (approveImagePlan.fulfilled.match(result)) {
      const approvedEbook = result.payload;

      dispatch(setCurrentEbook(approvedEbook));

      toast.success("Image plan approved.");
    }
  };

  const handleGenerateImages = async () => {
    const result = await dispatch(generateImages(id));

    if (generateImages.fulfilled.match(result)) {
      toast.success("Images generated successfully.");
    }
  };

  const handleApproveImages = async () => {
    const result = await dispatch(approveImages(id));

    if (approveImages.fulfilled.match(result)) {
      const approvedEbook = result.payload;

      dispatch(setCurrentEbook(approvedEbook));

      toast.success("Images approved.");

      setActiveTab("cover");
    }
  };

  /*
   * --------------------------------------------------
   * Cover
   * --------------------------------------------------
   */

  const handleGenerateCover = async () => {
    console.log("GENERATE COVER CLICKED");

    const result = await dispatch(generateCover(id));

    console.log("GENERATE COVER RESULT:", result);

    if (generateCover.fulfilled.match(result)) {
      const generatedEbook = result.payload;

      dispatch(setCurrentEbook(generatedEbook));

      toast.success("Cover generated successfully.");
    }
  };

  const handleApproveCover = async () => {
    const result = await dispatch(approveCover(id));

    if (approveCover.fulfilled.match(result)) {
      const completedEbook = result.payload;

      dispatch(setCurrentEbook(completedEbook));

      toast.success("Ebook completed successfully.");

      setActiveTab("assembly");
    }
  };

  /*
   * --------------------------------------------------
   * Assembly
   * --------------------------------------------------
   */

  const handleGenerateAssembly = async () => {
    const result = await dispatch(generateAssembly(id));

    if (generateAssembly.fulfilled.match(result)) {
      dispatch(setCurrentEbook(result.payload));

      toast.success("Ebook assembled successfully.");
    }
  };

  const handleApproveAssembly = async () => {
    const result = await dispatch(approveAssembly(id));

    if (approveAssembly.fulfilled.match(result)) {
      dispatch(setCurrentEbook(result.payload));

      toast.success("Assembly approved.");

      setActiveTab("export");
    }
  };

  /*
   * --------------------------------------------------
   * Export
   * --------------------------------------------------
   */

  const handleExportPdf = async () => {
    const result = await dispatch(exportPdf(id));

    if (exportPdf.fulfilled.match(result)) {
      dispatch(setCurrentEbook(result.payload));

      toast.success("PDF generated successfully.");
    }
  };

  const handleExportEpub = async () => {
    const result = await dispatch(exportEpub(id));

    if (exportEpub.fulfilled.match(result)) {
      dispatch(setCurrentEbook(result.payload));

      toast.success("EPUB generated successfully.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}

      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="rounded-lg p-2 hover:bg-zinc-100">
              <ArrowLeft size={18} />
            </Link>

            <div>
              <h1 className="font-semibold">{ebook.title}</h1>

              <p className="text-xs capitalize text-zinc-500">
                {ebook.status?.replace(/_/g, " ")}
              </p>
            </div>
          </div>

          {operationLoading && (
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Loader2 size={15} className="animate-spin" />
              AI is working...
            </div>
          )}
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        <EbookWorkspaceSidebar activeTab={activeTab} onChange={setActiveTab} />

        <main className="min-w-0 flex-1 p-6">
          <div className="mx-auto max-w-5xl">
            <Suspense fallback={<EditorLoading />}>
              {activeTab === "overview" && (
                <Overview
                  ebook={ebook}
                  onGenerateSpecification={handleGenerateSpecification}
                  operationLoading={operationLoading}
                />
              )}

              {activeTab === "specification" && (
                <SpecificationEditor
                  specification={specification}
                  setSpecification={setSpecification}
                  approved={ebook.specificationApproved}
                  onSave={handleSaveSpecification}
                  onApprove={handleApproveSpecification}
                  onGenerate={handleGenerateSpecification}
                  loading={operationLoading}
                />
              )}

              {activeTab === "outline" && (
                <OutlineEditor
                  outline={outline}
                  setOutline={setOutline}
                  specificationApproved={ebook.specificationApproved}
                  onGenerate={handleGenerateOutline}
                  onSave={handleSaveOutline}
                  onApprove={handleApproveOutline}
                  loading={operationLoading}
                />
              )}

              {activeTab === "chapters" && (
                <ChaptersEditor
                  ebook={ebook}
                  onGenerate={handleGenerateChapters}
                  onApprove={handleApproveChapters}
                  loading={operationLoading}
                />
              )}

              {activeTab === "images" && (
                <ImagesEditor
                  ebook={ebook}
                  onGenerate={handleGenerateImagePlan}
                  onApprove={handleApproveImagePlan}
                  onGenerateImages={handleGenerateImages}
                  onApproveImages={handleApproveImages}
                  loading={operationLoading}
                />
              )}

              {activeTab === "cover" && (
                <CoverEditor
                  ebook={ebook}
                  onGenerate={handleGenerateCover}
                  onApprove={handleApproveCover}
                  loading={operationLoading}
                />
              )}

              {activeTab === "assembly" && (
                <AssemblyEditor
                  ebook={ebook}
                  loading={operationLoading}
                  onGenerate={handleGenerateAssembly}
                  onApprove={handleApproveAssembly}
                />
              )}

              {activeTab === "export" && (
                <ExportEditor
                  ebook={ebook}
                  loading={operationLoading}
                  onExportPdf={handleExportPdf}
                  onExportEpub={handleExportEpub}
                />
              )}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EbookWorkspacePage;
