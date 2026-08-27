import { useDispatch, useSelector } from "react-redux";

import {
  updatePaperSettings,
  updatePaperSection,
} from "../../editor/editorSlice";

export default function PaperSettings() {
  const dispatch = useDispatch();

  const paper = useSelector((state) => state.editor.paper);

  function updateSetting(key, value) {
    dispatch(
      updatePaperSettings({
        changes: {
          [key]: value,
        },
      }),
    );
  }

  function updateSection(section, key, value) {
    dispatch(
      updatePaperSection({
        section,
        changes: {
          [key]: value,
        },
      }),
    );
  }

  return (
    <aside className="w-80 shrink-0 overflow-y-auto border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-900">Paper Designer</h2>

        <p className="mt-1 text-xs text-slate-400">
          Configure how the exam paper should look.
        </p>
      </div>

      <div className="space-y-8 p-5">
        {/* PAGE */}

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Page
          </h3>

          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Page size
              </span>

              <select
                value={paper.pageSize}
                onChange={(event) =>
                  updateSetting("pageSize", event.target.value)
                }
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
              >
                <option value="A4">A4</option>
                <option value="LETTER">Letter</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Orientation
              </span>

              <select
                value={paper.orientation}
                onChange={(event) =>
                  updateSetting("orientation", event.target.value)
                }
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
              >
                <option value="portrait">Portrait</option>

                <option value="landscape">Landscape</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Columns
              </span>

              <select
                value={paper.columns}
                onChange={(event) =>
                  updateSetting("columns", Number(event.target.value))
                }
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
              >
                <option value={1}>1 column</option>
                <option value={2}>2 columns</option>
              </select>
            </label>
          </div>
        </section>

        {/* HEADER */}

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Header
          </h3>

          <label className="mt-4 flex items-center gap-3">
            <input
              type="checkbox"
              checked={paper.header.enabled}
              onChange={(event) =>
                updateSection("header", "enabled", event.target.checked)
              }
              className="h-4 w-4"
            />

            <span className="text-sm text-slate-700">Show header</span>
          </label>

          {paper.header.enabled && (
            <div className="mt-4 space-y-3">
              <input
                value={paper.header.schoolName}
                onChange={(event) =>
                  updateSection("header", "schoolName", event.target.value)
                }
                placeholder="School name"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
              />

              <input
                value={paper.header.subject}
                onChange={(event) =>
                  updateSection("header", "subject", event.target.value)
                }
                placeholder="Subject"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
              />

              <input
                value={paper.header.teacher}
                onChange={(event) =>
                  updateSection("header", "teacher", event.target.value)
                }
                placeholder="Teacher"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
              />

              <input
                value={paper.header.date}
                onChange={(event) =>
                  updateSection("header", "date", event.target.value)
                }
                placeholder="Date"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
              />

              <input
                value={paper.header.duration}
                onChange={(event) =>
                  updateSection("header", "duration", event.target.value)
                }
                placeholder="Duration"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
              />
            </div>
          )}
        </section>

        {/* STUDENT INFO */}

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Student Information
          </h3>

          <div className="mt-4 space-y-3">
            {[
              ["name", "Name"],
              ["gradeSection", "Grade / Section"],
              ["date", "Date"],
              ["score", "Score"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={paper.studentInfo[key]}
                  onChange={(event) =>
                    updateSection("studentInfo", key, event.target.checked)
                  }
                  className="h-4 w-4"
                />

                <span className="text-sm text-slate-700">{label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* INSTRUCTIONS */}

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Instructions
          </h3>

          <textarea
            value={paper.instructions}
            onChange={(event) =>
              updateSetting("instructions", event.target.value)
            }
            rows={5}
            placeholder="Enter exam instructions..."
            className="mt-4 w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-slate-400"
          />
        </section>

        {/* FOOTER */}

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Footer
          </h3>

          <label className="mt-4 flex items-center gap-3">
            <input
              type="checkbox"
              checked={paper.footer.enabled}
              onChange={(event) =>
                updateSection("footer", "enabled", event.target.checked)
              }
              className="h-4 w-4"
            />

            <span className="text-sm text-slate-700">Show footer</span>
          </label>

          {paper.footer.enabled && (
            <div className="mt-4 space-y-3">
              <input
                value={paper.footer.text}
                onChange={(event) =>
                  updateSection("footer", "text", event.target.value)
                }
                placeholder="Footer text"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
              />

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={paper.footer.showPageNumber}
                  onChange={(event) =>
                    updateSection(
                      "footer",
                      "showPageNumber",
                      event.target.checked,
                    )
                  }
                  className="h-4 w-4"
                />

                <span className="text-sm text-slate-700">Show page number</span>
              </label>
            </div>
          )}
        </section>
      </div>
    </aside>
  );
}
