const ClassroomPreview = ({ page }) => {
  if (!page) {
    return null;
  }

  switch (page.type) {
    case "cover":
      return <ClassroomCover />;

    case "title-page":
      return <ClassroomTitlePage />;

    case "story-spread":
      return <ClassroomSpread spreadNumber={page.spreadNumber} />;

    case "ending":
      return <ClassroomEnding />;

    case "back-cover":
      return <ClassroomBackCover />;

    default:
      return null;
  }
};

const ClassroomCover = () => {
  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-white shadow-2xl">
      <div className="border-b-8 border-zinc-900 bg-zinc-100 p-7">
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
          LEARNING BOOK
        </span>

        <h1 className="mt-5 text-4xl font-black leading-tight text-zinc-900">
          Let's Learn
          <br />
          Together!
        </h1>

        <p className="mt-3 text-sm font-medium text-zinc-600">
          A fun learning adventure
        </p>
      </div>

      <div className="flex h-[55%] items-center justify-center bg-white">
        <div className="flex h-48 w-64 items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50">
          <span className="text-xs text-zinc-400">
            Educational illustration
          </span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-200 bg-zinc-50 p-6">
        <p className="text-xs font-semibold text-zinc-500">Written by</p>

        <p className="mt-1 text-sm font-bold text-zinc-900">Author Name</p>
      </div>
    </div>
  );
};

const ClassroomTitlePage = () => {
  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-white p-8 shadow-2xl">
      <div className="border-b-2 border-zinc-900 pb-5">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          UNIT 1
        </p>

        <h1 className="mt-2 text-3xl font-black text-zinc-900">Let's Begin!</h1>
      </div>

      <div className="mt-8 flex aspect-[4/3] items-center justify-center rounded-xl bg-zinc-100">
        <span className="text-xs text-zinc-400">Lesson illustration</span>
      </div>

      <div className="mt-8">
        <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
          Learning Goal
        </p>

        <p className="mt-2 text-sm font-medium leading-7 text-zinc-700">
          Understand the main ideas and practice using what you have learned.
        </p>
      </div>

      <div className="absolute bottom-6 left-8 right-8 flex justify-between text-[10px] text-zinc-400">
        <span>Lesson 1</span>
        <span>1</span>
      </div>
    </div>
  );
};

const ClassroomSpread = ({ spreadNumber }) => {
  const lessons = {
    1: {
      lesson: "Lesson 1",
      title: "What Are Numbers?",
      objective: "Recognize numbers and understand how they are used.",
      activity: "Find three numbers around you.",
    },

    2: {
      lesson: "Lesson 2",
      title: "Let's Practice",
      objective: "Use what you learned to solve simple examples.",
      activity: "Try the example and explain your answer.",
    },

    3: {
      lesson: "Lesson 3",
      title: "Show What You Know",
      objective: "Review the main ideas and demonstrate your understanding.",
      activity: "Complete the challenge below.",
    },
  };

  const lesson = lessons[spreadNumber] || lessons[1];

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-zinc-300 p-2 shadow-2xl">
      <div className="grid grid-cols-2 overflow-hidden rounded-xl bg-white">
        {/* LEFT PAGE */}

        <div className="relative min-h-[540px] border-r border-zinc-200 p-7">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              {lesson.lesson}
            </span>

            <span className="rounded bg-zinc-900 px-2 py-1 text-[9px] font-bold text-white">
              LEARN
            </span>
          </div>

          <h2 className="mt-6 text-2xl font-black text-zinc-900">
            {lesson.title}
          </h2>

          <div className="mt-6 flex aspect-[4/3] items-center justify-center rounded-xl bg-zinc-100">
            <span className="text-xs text-zinc-400">Educational diagram</span>
          </div>

          <div className="mt-6 rounded-xl border border-zinc-200 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">
              Learning Goal
            </p>

            <p className="mt-2 text-sm leading-6 text-zinc-700">
              {lesson.objective}
            </p>
          </div>
        </div>

        {/* RIGHT PAGE */}

        <div className="relative min-h-[540px] bg-zinc-50 p-7">
          <div className="border-b border-zinc-200 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              TRY IT
            </span>

            <h3 className="mt-2 text-xl font-black text-zinc-900">Your Turn</h3>
          </div>

          <div className="mt-7 rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold leading-6 text-zinc-800">
              {lesson.activity}
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {[1, 2, 3].map((number) => (
              <div
                key={number}
                className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-4"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white">
                  {number}
                </div>

                <div className="h-2 flex-1 rounded bg-zinc-100" />
              </div>
            ))}
          </div>

          <div className="absolute bottom-6 left-7 right-7 flex justify-between text-[10px] text-zinc-400">
            <span>Practice</span>
            <span>{spreadNumber + 1}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ClassroomEnding = () => {
  return (
    <div className="relative flex aspect-[3/4] flex-col items-center justify-center overflow-hidden rounded-2xl bg-white p-10 text-center shadow-2xl">
      <div className="flex h-28 w-28 items-center justify-center rounded-full bg-zinc-900 text-white">
        <span className="text-xs font-bold">DONE!</span>
      </div>

      <h1 className="mt-8 text-4xl font-black text-zinc-900">Great Work!</h1>

      <p className="mt-4 max-w-xs text-sm leading-7 text-zinc-500">
        You learned something new. Keep asking questions and keep exploring.
      </p>

      <div className="mt-8 rounded-xl border border-zinc-200 px-5 py-3 text-xs font-semibold text-zinc-700">
        ⭐ Learning Complete
      </div>
    </div>
  );
};

const ClassroomBackCover = () => {
  return (
    <div className="relative flex aspect-[3/4] flex-col items-center justify-center overflow-hidden rounded-2xl bg-zinc-900 p-10 text-center text-white shadow-2xl">
      <div className="flex h-32 w-32 items-center justify-center rounded-xl border-2 border-dashed border-white/30">
        <span className="text-xs text-white/40">Educational illustration</span>
      </div>

      <h2 className="mt-8 text-2xl font-black">Keep Learning!</h2>

      <p className="mt-4 max-w-xs text-sm leading-7 text-white/60">
        Every question is the beginning of something new.
      </p>

      <div className="absolute bottom-7 text-[10px] text-white/40">
        Publisher / ISBN
      </div>
    </div>
  );
};

export default ClassroomPreview;
