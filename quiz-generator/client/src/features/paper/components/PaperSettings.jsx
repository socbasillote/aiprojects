import { useDispatch, useSelector } from "react-redux";

import {
  updatePaperSettings,
  updatePaperSection,
} from "../../editor/editorSlice";

export default function PaperSettings() {
  const dispatch = useDispatch();

  const paper = useSelector((state) => state.editor.paper);

  function updateSetting(changes) {
    dispatch(updatePaperSettings({ changes }));
  }

  function updateSection(section, changes) {
    dispatch(
      updatePaperSection({
        section,
        changes,
      }),
    );
  }

  return (
    <aside className="w-72 shrink-0 overflow-y-auto border-l border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-4">
        <h2 className="text-sm font-semibold text-slate-900">Paper Settings</h2>

        <p className="mt-1 text-xs text-slate-400">
          Configure the exam paper layout.
        </p>
      </div>

      <div className="space-y-6 p-4">
        {/* PAGE */}

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Page
          </h3>

          <div className="mt-3 space-y-3">
            <label className="block">
              <span className="text-xs text-slate-500">Page size</span>

              <select
                value={paper.pageSize}
                onChange={(event) =>
                  updateSetting({
                    pageSize: event.target.value,
                  })
                }
                className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm"
              >
                <option value="A4">A4</option>
                <option value="Letter">Letter</option>
                <option value="Legal">Legal</option>
              </select>
            </label>

            <label className="block">
              <span className="text-xs text-slate-500">Orientation</span>

              <select
                value={paper.orientation}
                onChange={(event) =>
                  updateSetting({
                    orientation: event.target.value,
                  })
                }
                className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm"
              >
                <option value="portrait">Portrait</option>

                <option value="landscape">Landscape</option>
              </select>
            </label>

            <label className="block">
              <span className="text-xs text-slate-500">Columns</span>

              <select
                value={paper.columns}
                onChange={(event) =>
                  updateSetting({
                    columns: Number(event.target.value),
                  })
                }
                className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm"
              >
                <option value={1}>1 column</option>
                <option value={2}>2 columns</option>
              </select>
            </label>
          </div>
        </section>

        {/* MARGINS */}

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Margins
          </h3>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <MarginInput
              label="Top"
              value={paper.margins.top}
              onChange={(value) =>
                updateSetting({
                  margins: {
                    ...paper.margins,
                    top: value,
                  },
                })
              }
            />

            <MarginInput
              label="Right"
              value={paper.margins.right}
              onChange={(value) =>
                updateSetting({
                  margins: {
                    ...paper.margins,
                    right: value,
                  },
                })
              }
            />

            <MarginInput
              label="Bottom"
              value={paper.margins.bottom}
              onChange={(value) =>
                updateSetting({
                  margins: {
                    ...paper.margins,
                    bottom: value,
                  },
                })
              }
            />

            <MarginInput
              label="Left"
              value={paper.margins.left}
              onChange={(value) =>
                updateSetting({
                  margins: {
                    ...paper.margins,
                    left: value,
                  },
                })
              }
            />
          </div>
        </section>

        {/* HEADER */}

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Header
          </h3>

          <div className="mt-3 space-y-3">
            <Toggle
              label="Show header"
              checked={paper.header.enabled}
              onChange={(checked) =>
                updateSection("header", {
                  enabled: checked,
                })
              }
            />

            {paper.header.enabled && (
              <>
                <TextInput
                  label="School name"
                  value={paper.header.schoolName}
                  onChange={(value) =>
                    updateSection("header", {
                      schoolName: value,
                    })
                  }
                />

                <TextInput
                  label="Subject"
                  value={paper.header.subject}
                  onChange={(value) =>
                    updateSection("header", {
                      subject: value,
                    })
                  }
                />

                <TextInput
                  label="Teacher"
                  value={paper.header.teacher}
                  onChange={(value) =>
                    updateSection("header", {
                      teacher: value,
                    })
                  }
                />

                <TextInput
                  label="Date"
                  value={paper.header.date}
                  onChange={(value) =>
                    updateSection("header", {
                      date: value,
                    })
                  }
                />

                <TextInput
                  label="Duration"
                  value={paper.header.duration}
                  onChange={(value) =>
                    updateSection("header", {
                      duration: value,
                    })
                  }
                />
              </>
            )}
          </div>
        </section>

        {/* STUDENT INFO */}

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Student Information
          </h3>

          <div className="mt-3 space-y-2">
            <Toggle
              label="Show student information"
              checked={paper.studentInfo.enabled}
              onChange={(checked) =>
                updateSection("studentInfo", {
                  enabled: checked,
                })
              }
            />

            {paper.studentInfo.enabled && (
              <>
                <Toggle
                  label="Name"
                  checked={paper.studentInfo.name}
                  onChange={(checked) =>
                    updateSection("studentInfo", {
                      name: checked,
                    })
                  }
                />

                <Toggle
                  label="Grade / Section"
                  checked={paper.studentInfo.gradeSection}
                  onChange={(checked) =>
                    updateSection("studentInfo", {
                      gradeSection: checked,
                    })
                  }
                />

                <Toggle
                  label="Date"
                  checked={paper.studentInfo.date}
                  onChange={(checked) =>
                    updateSection("studentInfo", {
                      date: checked,
                    })
                  }
                />

                <Toggle
                  label="Score"
                  checked={paper.studentInfo.score}
                  onChange={(checked) =>
                    updateSection("studentInfo", {
                      score: checked,
                    })
                  }
                />
              </>
            )}
          </div>
        </section>

        {/* INSTRUCTIONS */}

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Instructions
          </h3>

          <textarea
            value={paper.instructions}
            onChange={(event) =>
              updateSetting({
                instructions: event.target.value,
              })
            }
            rows={4}
            placeholder="Enter instructions..."
            className="mt-3 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </section>

        {/* FOOTER */}

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Footer
          </h3>

          <div className="mt-3 space-y-3">
            <Toggle
              label="Show footer"
              checked={paper.footer.enabled}
              onChange={(checked) =>
                updateSection("footer", {
                  enabled: checked,
                })
              }
            />

            {paper.footer.enabled && (
              <>
                <TextInput
                  label="Footer text"
                  value={paper.footer.text}
                  onChange={(value) =>
                    updateSection("footer", {
                      text: value,
                    })
                  }
                />

                <Toggle
                  label="Show page number"
                  checked={paper.footer.showPageNumber}
                  onChange={(checked) =>
                    updateSection("footer", {
                      showPageNumber: checked,
                    })
                  }
                />
              </>
            )}
          </div>
        </section>
      </div>
    </aside>
  );
}

function MarginInput({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-500">{label}</span>

      <div className="mt-1 flex items-center">
        <input
          type="number"
          min="0"
          max="100"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full rounded-l-md border border-slate-300 px-2.5 py-2 text-sm"
        />

        <span className="rounded-r-md border border-l-0 border-slate-300 bg-slate-50 px-2 py-2 text-xs text-slate-500">
          mm
        </span>
      </div>
    </label>
  );
}

function TextInput({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-500">{label}</span>

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm outline-none focus:border-slate-500"
      />
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-slate-300"
      />

      <span>{label}</span>
    </label>
  );
}
