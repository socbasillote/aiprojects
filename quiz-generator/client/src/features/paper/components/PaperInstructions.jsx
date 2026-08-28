export default function PaperInstructions({ instructions }) {
  if (!instructions) {
    return null;
  }

  return (
    <section className="mt-5">
      <h2 className="text-sm font-bold">Instructions</h2>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
        {instructions}
      </p>
    </section>
  );
}
