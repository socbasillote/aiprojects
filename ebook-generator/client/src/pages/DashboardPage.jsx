import { useEffect } from "react";

import { Link, useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import { BookOpen, LogOut, Plus, Trash2 } from "lucide-react";

import { fetchEbooks, deleteEbook } from "../features/ebooks/ebookSlice.js";

import { logoutUser } from "../features/auth/authSlice.js";

import { toast } from "sonner";

const DashboardPage = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const { items, loading } = useSelector((state) => state.ebooks);

  useEffect(() => {
    dispatch(fetchEbooks());
  }, [dispatch]);

  const handleDelete = async (ebookId) => {
    const confirmed = window.confirm("Delete this ebook?");

    if (!confirmed) {
      return;
    }

    const result = await dispatch(deleteEbook(ebookId));

    if (deleteEbook.fulfilled.match(result)) {
      toast.success("Ebook deleted.");
    } else {
      toast.error(result.payload || "Unable to delete ebook.");
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white">
              <BookOpen size={18} />
            </div>

            <span className="font-semibold">Ebook Studio</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-zinc-500 sm:block">
              {user?.firstName} {user?.lastName}
            </span>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Your ebooks
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Create, develop, and manage your ebook projects.
            </p>
          </div>

          <Link
            to="/ebooks/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            <Plus size={17} />
            Create ebook
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({
              length: 3,
            }).map((_, index) => (
              <div
                key={index}
                className="h-48 animate-pulse rounded-2xl bg-zinc-200"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
            <BookOpen className="mx-auto text-zinc-400" size={32} />

            <h2 className="mt-4 font-medium">No ebooks yet</h2>

            <p className="mt-2 text-sm text-zinc-500">
              Start your first ebook project.
            </p>

            <Link
              to="/ebooks/new"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white"
            >
              <Plus size={16} />
              Create ebook
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((ebook) => (
              <div
                key={ebook._id}
                className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex h-32 items-center justify-center rounded-xl bg-zinc-100">
                  <BookOpen size={32} className="text-zinc-400" />
                </div>

                <div className="mt-5">
                  <h2 className="line-clamp-1 font-semibold">{ebook.title}</h2>

                  <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                    {ebook.description || "No description."}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium capitalize text-zinc-600">
                    {ebook.status?.replace(/_/g, " ")}
                  </span>

                  <div className="flex gap-1">
                    <Link
                      to={`/ebooks/${ebook._id}`}
                      className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-zinc-100"
                    >
                      Open
                    </Link>

                    <button
                      onClick={() => handleDelete(ebook._id)}
                      className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
