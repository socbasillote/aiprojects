import { useSelector } from "react-redux";

import { getPaperDimensions } from "../paperUtils";
import PaperQuestion from "./PaperQuestion";

export default function PaperPreview() {
  const title = useSelector((state) => state.editor.title);

  const questions = useSelector((state) => state.editor.questions);

  const sections = useSelector((state) => state.editor.sections);

  const paper = useSelector((state) => state.editor.paper);

  const dimensions = getPaperDimensions(paper.pageSize, paper.orientation);

  function getQuestionById(questionId) {
    return questions.find((question) => question.id === questionId);
  }

  function getSectionQuestions(section) {
    return section.questionIds.map(getQuestionById).filter(Boolean);
  }

  let questionNumber = 0;

  return (
    <div className="flex-1 overflow-auto bg-slate-100 p-10">
      <div
        className="mx-auto bg-white shadow-xl"
        style={{
          width: `${dimensions.width}mm`,
          minHeight: `${dimensions.height}mm`,

          padding: `${paper.margins.top}mm ${paper.margins.right}mm ${paper.margins.bottom}mm ${paper.margins.left}mm`,
        }}
      >
        {/* =========================================
            HEADER
        ========================================= */}

        {paper.header.enabled && (
          <header className="border-b border-slate-300 pb-4 text-center">
            {paper.header.schoolName && (
              <div className="text-sm font-bold uppercase">
                {paper.header.schoolName}
              </div>
            )}

            <h1 className="mt-1 text-xl font-bold">{title}</h1>

            {paper.header.subject && (
              <div className="mt-1 text-sm">{paper.header.subject}</div>
            )}

            <div className="mt-3 flex justify-between text-xs">
              <span>Teacher: {paper.header.teacher || "____________"}</span>

              <span>Date: {paper.header.date || "____________"}</span>

              <span>Duration: {paper.header.duration || "____________"}</span>
            </div>
          </header>
        )}

        {/* =========================================
            STUDENT INFORMATION
        ========================================= */}

        {paper.studentInfo.enabled && (
          <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3 border-b border-slate-300 pb-5 text-sm">
            {paper.studentInfo.name && (
              <div>
                Name:{" "}
                <span className="inline-block w-48 border-b border-slate-400" />
              </div>
            )}

            {paper.studentInfo.gradeSection && (
              <div>
                Grade / Section:{" "}
                <span className="inline-block w-32 border-b border-slate-400" />
              </div>
            )}

            {paper.studentInfo.date && (
              <div>
                Date:{" "}
                <span className="inline-block w-32 border-b border-slate-400" />
              </div>
            )}

            {paper.studentInfo.score && (
              <div>
                Score:{" "}
                <span className="inline-block w-20 border-b border-slate-400" />
              </div>
            )}
          </div>
        )}

        {/* =========================================
            GENERAL INSTRUCTIONS
        ========================================= */}

        {paper.instructions && (
          <section className="mt-5">
            <h2 className="text-sm font-bold">Instructions</h2>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
              {paper.instructions}
            </p>
          </section>
        )}

        {/* =========================================
            SECTIONS
        ========================================= */}

        <div className="mt-6">
          {sections.map((section, sectionIndex) => {
            const sectionQuestions = getSectionQuestions(section);

            return (
              <section
                key={section.id}
                className={sectionIndex > 0 ? "mt-8" : ""}
              >
                {/* SECTION HEADING */}

                <div className="mb-4">
                  <h2 className="text-base font-bold uppercase tracking-wide">
                    {sectionIndex + 1}. {section.title || "Untitled Section"}
                  </h2>

                  {section.instructions && (
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                      {section.instructions}
                    </p>
                  )}
                </div>

                {/* QUESTIONS */}

                <div
                  className={
                    paper.columns === 2 ? "grid grid-cols-2 gap-x-8" : "block"
                  }
                >
                  {sectionQuestions.map((question) => {
                    questionNumber += 1;

                    return (
                      <div key={question.id} className="mb-6">
                        <PaperQuestion
                          question={question}
                          number={questionNumber}
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* =========================================
            FOOTER
        ========================================= */}

        {paper.footer.enabled && (
          <footer className="mt-10 border-t border-slate-300 pt-3 text-center text-xs text-slate-500">
            {paper.footer.text}

            {paper.footer.showPageNumber && (
              <span className="ml-4">Page 1</span>
            )}
          </footer>
        )}
      </div>
    </div>
  );
}
