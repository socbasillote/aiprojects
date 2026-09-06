import { useDispatch, useSelector } from "react-redux";

import {
  selectQuestion,
  updatePaperSettings,
  updatePaperSection,
} from "../../editor/editorSlice";
import PropertiesPanel from "../../editor/components/PropertiesPanel";

export default function PaperSettings({ isOpen, onToggle }) {
  const dispatch = useDispatch();

  const paper = useSelector((state) => state.editor.paper);
  const selectedQuestionId = useSelector(
    (state) => state.editor.selectedQuestionId,
  );

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

  if (!isOpen && !selectedQuestionId) {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-label="Open paper settings"
        title="Open paper settings"
        className="w-9 shrink-0 border-l border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
      >
        <span className="text-xs [writing-mode:vertical-rl]">Settings</span>
      </button>
    );
  }

  return (
    <aside
      className="w-72 shrink-0 overflow-y-auto border-l border-slate-200 bg-white"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              {selectedQuestionId ? "Question Properties" : "Paper Settings"}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {selectedQuestionId
                ? "Configure the selected question."
                : "Configure the exam paper layout."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => dispatch(selectQuestion(null))}
            aria-label="Show paper settings"
            title="Show paper settings"
            className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            Paper Settings
          </button>

          <button
            type="button"
            onClick={onToggle}
            aria-label="Close paper settings"
            title="Close paper settings"
            className="rounded px-2 py-1 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            Hide
          </button>
        </div>
      </div>

      {selectedQuestionId ? (
        <PropertiesPanel embedded />
      ) : (
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
                  <option value="A3">A3</option>
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

            <div className="mt-4 border-t border-slate-200 pt-4">
              <Toggle
                label="Show answer keys"
                checked={paper.showAnswerKey}
                onChange={(checked) =>
                  updateSetting({
                    showAnswerKey: checked,
                  })
                }
              />
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

            <div className="mt-3 space-y-2">
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
                <div className="space-y-2 border-l border-slate-200 pl-3">
                  <Toggle
                    label="School name"
                    checked={paper.header.showSchoolName}
                    onChange={(checked) =>
                      updateSection("header", {
                        showSchoolName: checked,
                      })
                    }
                  />

                  <Toggle
                    label="Subject"
                    checked={paper.header.showSubject}
                    onChange={(checked) =>
                      updateSection("header", {
                        showSubject: checked,
                      })
                    }
                  />

                  <Toggle
                    label="Teacher"
                    checked={paper.header.showTeacher}
                    onChange={(checked) =>
                      updateSection("header", {
                        showTeacher: checked,
                      })
                    }
                  />

                  <Toggle
                    label="Date"
                    checked={paper.header.showDate}
                    onChange={(checked) =>
                      updateSection("header", {
                        showDate: checked,
                      })
                    }
                  />

                  <Toggle
                    label="Duration"
                    checked={paper.header.showDuration}
                    onChange={(checked) =>
                      updateSection("header", {
                        showDuration: checked,
                      })
                    }
                  />
                </div>
              )}

              {paper.header.enabled && (
                <div className="mt-3 space-y-3">
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
                </div>
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
      )}
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
