import { useEffect, useState } from "react";

import { useParams, Link } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import { ArrowLeft, Check, Loader2, RefreshCw, Save } from "lucide-react";

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
  setCurrentEbook,
  generateImages,
  approveImages,
  generateCover,
  approveCover,
  generateAssembly,
  approveAssembly,
  exportPdf,
  exportEpub,
} from "../features/ebooks/ebookSlice.js";

import ChaptersEditor from "./ChaptersEditor.jsx";
import ImagesEditor from "./ImagesEditor.jsx";

import { toast } from "sonner";
import EbookWorkspaceSidebar from "../components/ebook/EbookWorkspaceSidebar.jsx";
import Overview from "../components/ebook/Overview.jsx";
import SpecificationEditor from "../components/ebook/editors/SpecificationEditor.jsx";
import OutlineEditor from "../components/ebook/editors/OutlineEditor.jsx";

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

const EbookWorkspacePages = () => {
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

  useEffect(() => {
    dispatch(fetchEbook(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (ebook?.specification) {
      setSpecification(ebook.specification);
    }

    if (ebook?.outline) {
      setOutline(ebook.outline);
    }
  }, [ebook]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  if (loading && !ebook) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

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

      console.log("APPROVED EBOOK:", approvedEbook);

      console.log("APPROVED:", approvedEbook?.specificationApproved);

      toast.success("Specification approved.");

      setActiveTab("outline");
    }
  };

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

      toast.success("Outline approved.");

      dispatch(setCurrentEbook(approvedEbook));

      setActiveTab("chapters");
    }
  };

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

  const handleGenerateCover = async () => {
    console.log("GENERATE COVER CLICKED");

    const result = await dispatch(generateCover(id));

    console.log("GENERATE COVER RESULT:", result);

    if (generateCover.fulfilled.match(result)) {
      const generatedEbook = result.payload;

      console.log("GENERATED COVER EBOOK:", generatedEbook);
      console.log("GENERATED COVER:", generatedEbook?.cover);
      console.log("GENERATED COVER STATUS:", generatedEbook?.cover?.status);
      console.log("GENERATED COVER URL:", generatedEbook?.cover?.url);

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

      /*
       * Stay on cover for now so the user
       * can see the completed state.
       */
      setActiveTab("assembly");
    }
  };

  console.log("COVER FROM BACKEND:", ebook?.cover);
  console.log("COVER STATUS:", ebook?.cover?.status);
  console.log("EBOOK STATUS:", ebook?.status);

  const EditorLoading = () => (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Loader2 size={18} className="animate-spin" />
        Loading editor...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50">
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
        <aside className="hidden w-60 shrink-0 border-r border-zinc-200 bg-white p-4 md:block">
          <nav className="space-y-1">
            {[
              ["overview", "Overview"],
              ["specification", "Specification"],
              ["outline", "Outline"],
              ["chapters", "Chapters"],
              ["images", "Images"],
              ["cover", "Cover"],
              ["assembly", "Assembly"],
              ["export", "Export"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={`w-full rounded-lg px-3 py-2.5 text-left text-sm ${
                  activeTab === value
                    ? "bg-zinc-100 font-medium"
                    : "text-zinc-500 hover:bg-zinc-50"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-6">
          <div className="mx-auto max-w-5xl">
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
                loading={loading}
                onGenerate={() => {
                  dispatch(generateAssembly(ebook._id));
                }}
                onApprove={async () => {
                  const result = await dispatch(approveAssembly(ebook._id));

                  if (approveAssembly.fulfilled.match(result)) {
                    // We'll route this to Export next.
                    setActiveTab("export");
                  }
                }}
              />
            )}
            {activeTab === "export" && (
              <ExportEditor
                ebook={ebook}
                loading={loading}
                onExportPdf={() => {
                  dispatch(exportPdf(ebook._id));
                }}
                onExportEpub={() => {
                  dispatch(exportEpub(ebook._id));
                }}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default EbookWorkspacePages;
