import { useEffect, useState } from "react";
import {
  FolderOpen,
  LogOut,
  Plus,
  Search,
  Sparkles,
  Clock3,
  Trash2,
} from "lucide-react";
import { useSelector } from "react-redux";
import { api } from "../../services/api.js";
import CreditPurchaseModal from "../billing/CreditPurchaseModal.jsx";
import { createDefaultDocument } from "../../types/design.js";

function formatDate(value) {
  if (!value) return "Not saved yet";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function ProjectPreview({ document }) {
  const canvas = document?.canvas || {
    background: "#fff",
    width: 1080,
    height: 1080,
  };
  const elements =
    document?.elementOrder
      ?.map((id) => document.elements?.[id])
      .filter(Boolean) || [];
  const text = elements.filter((element) => element.type === "text").slice(-2);
  const shapes = elements
    .filter((element) => ["rect", "circle", "ellipse"].includes(element.type))
    .slice(-4);
  const image = elements.find((element) => element.type === "image");

  return (
    <div
      className="relative aspect-4/3 overflow-hidden rounded-xl border border-white/10 bg-white"
      style={{ background: canvas.background || "#fff" }}
    >
      {shapes.map((element) => (
        <div
          key={element.id}
          className="absolute"
          style={{
            left: `${Math.max(0, Math.min(90, ((element.x || 0) / canvas.width) * 100))}%`,
            top: `${Math.max(0, Math.min(90, ((element.y || 0) / canvas.height) * 100))}%`,
            width: `${Math.max(4, Math.min(65, ((element.width || 100) / canvas.width) * 100))}%`,
            height: `${Math.max(4, Math.min(65, ((element.height || 100) / canvas.height) * 100))}%`,
            background: element.fill || "#dbeafe",
            borderRadius:
              element.type === "circle" || element.type === "ellipse"
                ? "999px"
                : `${Math.min(18, element.cornerRadius || 0)}px`,
            opacity: element.opacity ?? 1,
          }}
        />
      ))}
      {image && (
        <div
          className="absolute right-[8%] top-[14%] h-[42%] w-[34%] overflow-hidden rounded-lg bg-slate-200/50"
          style={{ transform: `rotate(${image.rotation || 0}deg)` }}
        >
          <img
            src={image.src}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      {text.map((element) => (
        <div
          key={element.id}
          className="absolute max-w-[82%] truncate font-semibold"
          style={{
            left: `${Math.max(2, Math.min(80, ((element.x || 0) / canvas.width) * 100))}%`,
            top: `${Math.max(2, Math.min(86, ((element.y || 0) / canvas.height) * 100))}%`,
            color: element.fill || "#111827",
            fontSize: `${Math.max(8, Math.min(22, (element.fontSize || 24) / 5))}px`,
            fontWeight: element.fontWeight || 700,
          }}
        >
          {element.text}
        </div>
      ))}
    </div>
  );
}

export default function Dashboard({ onOpenProject, onLogout }) {
  const user = useSelector((state) => state.auth.user);
  const [projects, setProjects] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [showCreditsModal, setShowCreditsModal] = useState(false);

  const loadProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api.listDesigns();
      setProjects(result.designs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const createProject = async () => {
    setCreating(true);
    setError("");
    try {
      const result = await api.createDesign({
        name: "Untitled design",
        document: createDefaultDocument(),
      });
      setProjects((current) => [result.design, ...current]);
      onOpenProject(result.design.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const deleteProject = async (project) => {
    if (!window.confirm(`Delete “${project.name}”? This cannot be undone.`))
      return;
    try {
      await api.deleteDesign(project.id);
      setProjects((current) =>
        current.filter((item) => item.id !== project.id),
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const filtered = projects.filter((project) =>
    project.name.toLowerCase().includes(query.toLowerCase()),
  );
  const firstName = user?.firstName || "there";

  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-200">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#101216]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-500 text-sm font-black text-white">
              L
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                Layer Studio
              </div>
              <div className="text-[10px] text-slate-500">
                AI-native graphics editor
              </div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-[11px] font-medium text-violet-300">
              {user?.aiCredits ?? 0} AI credits
            </span>
            <button
              onClick={() => setShowCreditsModal(true)}
              className="hidden h-9 items-center rounded-lg bg-violet-600 px-3 text-xs font-semibold text-white transition hover:bg-violet-500 sm:flex"
            >
              + Add credits
            </button>
            <span className="hidden text-xs text-slate-400 sm:block">
              {user?.email}
            </span>
            <button
              onClick={onLogout}
              className="flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs text-slate-300 transition hover:bg-white/5"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-blue-400">
              <Sparkles size={13} /> Workspace
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Good to see you, {firstName}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Create a project or continue working on one of your designs.
            </p>
          </div>
          <button
            disabled={creating}
            onClick={createProject}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/10 transition hover:bg-blue-400 disabled:opacity-50"
          >
            <Plus size={17} /> {creating ? "Creating…" : "New project"}
          </button>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-md flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects"
              className="h-10 w-full rounded-xl border border-white/10 bg-[#15181e] pl-9 pr-3 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-blue-500/50"
            />
          </div>
          <div className="text-xs text-slate-600">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid place-items-center py-24 text-sm text-slate-500">
            Loading projects…
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-[#121419] px-6 py-16 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white/5 text-slate-500">
              <FolderOpen size={22} />
            </div>
            <h2 className="mt-4 text-sm font-medium text-slate-300">
              {projects.length
                ? "No projects found"
                : "Your workspace is empty"}
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-600">
              {projects.length
                ? "Try a different project name."
                : "Create your first project to start designing."}
            </p>
            {!projects.length && (
              <button
                onClick={createProject}
                className="mt-5 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-slate-900"
              >
                Create your first project
              </button>
            )}
          </div>
        ) : (
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((project) => (
              <article
                key={project.id}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-[#121419] transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-[#15181e]"
              >
                <button
                  onClick={() => onOpenProject(project.id)}
                  className="block w-full text-left"
                >
                  <ProjectPreview document={project.document} />
                  <div className="px-4 pb-4 pt-3">
                    <div className="truncate text-sm font-medium text-slate-200">
                      {project.name}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-600">
                      <Clock3 size={11} /> Updated{" "}
                      {formatDate(project.updatedAt)}
                    </div>
                  </div>
                </button>
                <div className="flex items-center justify-between border-t border-white/5 px-4 py-2">
                  <button
                    onClick={() => onOpenProject(project.id)}
                    className="text-[11px] font-medium text-blue-400 opacity-80 transition hover:opacity-100"
                  >
                    Open editor
                  </button>
                  <button
                    onClick={() => deleteProject(project)}
                    className="grid h-7 w-7 place-items-center rounded-md text-slate-600 transition hover:bg-red-500/10 hover:text-red-400"
                    title="Delete project"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      {showCreditsModal && (
        <CreditPurchaseModal onClose={() => setShowCreditsModal(false)} />
      )}
    </div>
  );
}
