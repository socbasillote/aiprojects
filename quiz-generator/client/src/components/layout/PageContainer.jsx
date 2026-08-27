export default function PageContainer({ children }) {
  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <div className="mx-auto w-full max-w-7xl p-6">{children}</div>
    </main>
  );
}
