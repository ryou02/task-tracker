import { useEffect, useRef, useState } from 'react'

import trashIcon from '../assets/trash.png'
import { supabase } from '../lib/supabase'
import './DeadlinesPage.css'

const defaultPalette = ['#B53322', '#DDDeda', '#C5DCF6', '#C9E3BA', '#F2D6B5', '#E7D5EF']

function dayClass(daysLeft) {
  if (daysLeft < 0) return 'deadlines__days-cell--late'
  if (daysLeft <= 3) return 'deadlines__days-cell--soon'
  return 'deadlines__days-cell--upcoming'
}

function getContrast(hexColor) {
  const hex = hexColor.replace('#', '')
  if (hex.length !== 6) return '#3D3A32'
  const r = Number.parseInt(hex.slice(0, 2), 16)
  const g = Number.parseInt(hex.slice(2, 4), 16)
  const b = Number.parseInt(hex.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.62 ? '#3D3A32' : '#FDF9F2'
}

function formatDueLabel(dateString) {
  if (!dateString) return ''
  const date = new Date(`${dateString}T00:00:00`)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

function computeDaysLeft(dateString) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(`${dateString}T00:00:00`)
  due.setHours(0, 0, 0, 0)
  return Math.round((due - today) / 86400000)
}

function DeadlinesPage() {
  const [subjects, setSubjects] = useState([])
  const [selectedSubjectId, setSelectedSubjectId] = useState(null)
  const [subjectMenuOpen, setSubjectMenuOpen] = useState(false)

  const [taskName, setTaskName] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [deadlinesRows, setDeadlinesRows] = useState([])
  const [deadlinesError, setDeadlinesError] = useState('')
  const [addingTask, setAddingTask] = useState(false)
  const [subjectMenuRowId, setSubjectMenuRowId] = useState(null)
  const [editingCell, setEditingCell] = useState(null)
  const [assignmentDraft, setAssignmentDraft] = useState('')
  const dueInputRefs = useRef({})

  const [subjectModalOpen, setSubjectModalOpen] = useState(false)
  const [subjectDrafts, setSubjectDrafts] = useState([])
  const [removedSubjectIds, setRemovedSubjectIds] = useState([])
  const [savingSubjects, setSavingSubjects] = useState(false)
  const [subjectError, setSubjectError] = useState('')
  const [confirmSubjectDelete, setConfirmSubjectDelete] = useState(null)

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId) || null

  async function loadSubjects() {
    const { data, error } = await supabase
      .from('subjects')
      .select('id, name, color_bg, color_text, created_at')
      .order('created_at', { ascending: true })

    if (error) {
      setSubjectError(error.message)
      return
    }

    const rows = data || []
    setSubjects(rows)

    if (rows.length > 0) {
      setSelectedSubjectId((previous) => {
        if (previous && rows.find((row) => row.id === previous)) return previous
        return rows[0].id
      })
    } else {
      setSelectedSubjectId(null)
    }
  }

  async function loadDeadlines() {
    const { data, error } = await supabase
      .from('deadlines')
      .select('id, subject_id, assignment_name, due_on, subjects(name, color_bg, color_text)')
      .order('due_on', { ascending: true })

    if (error) {
      setDeadlinesError(error.message)
      return
    }

    const normalized = (data || []).map((row) => ({
      id: row.id,
      subject_id: row.subject_id,
      subject: row.subjects?.name || 'subject',
      color_bg: row.subjects?.color_bg || '#DDDeda',
      color_text: row.subjects?.color_text || '#3D3A32',
      assignment_name: row.assignment_name,
      due_on: row.due_on,
      due_on_label: formatDueLabel(row.due_on),
      days_left: computeDaysLeft(row.due_on),
    }))

    setDeadlinesRows(normalized)
  }

  useEffect(() => {
    loadSubjects()
    loadDeadlines()
  }, [])

  async function handleAddTask() {
    if (!selectedSubjectId) {
      setDeadlinesError('Create/select a subject first.')
      return
    }

    if (!taskName.trim()) {
      setDeadlinesError('Enter an assignment name.')
      return
    }

    if (!dueDate) {
      setDeadlinesError('Select a due date.')
      return
    }

    setAddingTask(true)
    setDeadlinesError('')

    const { error } = await supabase.from('deadlines').insert({
      subject_id: selectedSubjectId,
      assignment_name: taskName.trim(),
      due_on: dueDate,
    })

    if (error) {
      setDeadlinesError(error.message)
      setAddingTask(false)
      return
    }

    setTaskName('')
    setDueDate('')
    setAddingTask(false)
    await loadDeadlines()
  }

  async function patchDeadline(deadlineId, patch) {
    const { error } = await supabase.from('deadlines').update(patch).eq('id', deadlineId)
    if (error) {
      setDeadlinesError(error.message)
      return false
    }
    await loadDeadlines()
    return true
  }

  async function deleteDeadline(deadlineId) {
    const { error } = await supabase.from('deadlines').delete().eq('id', deadlineId)
    if (error) {
      setDeadlinesError(error.message)
      return
    }
    if (subjectMenuRowId === deadlineId) setSubjectMenuRowId(null)
    if (editingCell?.id === deadlineId) setEditingCell(null)
    await loadDeadlines()
  }

  function openSubjectModal() {
    setSubjectError('')
    setRemovedSubjectIds([])
    setSubjectDrafts(
      subjects.map((subject) => ({
        id: subject.id,
        name: subject.name,
        color_bg: subject.color_bg,
        color_text: subject.color_text,
      })),
    )
    setSubjectModalOpen(true)
    setSubjectMenuOpen(false)
  }

  function addSubjectDraft() {
    const nextColor = defaultPalette[subjectDrafts.length % defaultPalette.length]

    setSubjectDrafts((previous) => [
      ...previous,
      {
        id: `new-${Date.now()}-${previous.length}`,
        name: '',
        color_bg: nextColor,
        color_text: getContrast(nextColor),
      },
    ])
  }

  function updateSubjectDraft(draftId, patch) {
    setSubjectDrafts((previous) =>
      previous.map((draft) => {
        if (draft.id !== draftId) return draft

        const next = { ...draft, ...patch }
        if (patch.color_bg) {
          next.color_text = getContrast(patch.color_bg)
        }
        return next
      }),
    )
  }

  function finalizeSubjectDraftRemoval(draft) {
    if (!String(draft.id).startsWith('new-')) {
      setRemovedSubjectIds((previous) =>
        previous.includes(draft.id) ? previous : [...previous, draft.id],
      )
    }
    setSubjectDrafts((previous) => previous.filter((row) => row.id !== draft.id))
  }

  async function removeSubjectDraft(draft) {
    if (!String(draft.id).startsWith('new-')) {
      const { count, error } = await supabase
        .from('deadlines')
        .select('id', { count: 'exact', head: true })
        .eq('subject_id', draft.id)

      if (error) {
        setSubjectError(error.message)
        return
      }

      if ((count || 0) > 0) {
        setConfirmSubjectDelete({
          id: draft.id,
          name: draft.name || 'this subject',
          count: count || 0,
        })
        return
      }
    }

    finalizeSubjectDraftRemoval(draft)
  }

  async function confirmDeleteSubjectDraft() {
    if (!confirmSubjectDelete) return

    const subjectId = confirmSubjectDelete.id

    const { error: deadlinesDeleteError } = await supabase
      .from('deadlines')
      .delete()
      .eq('subject_id', subjectId)

    if (deadlinesDeleteError) {
      setSubjectError(deadlinesDeleteError.message)
      return
    }

    const { error: subjectDeleteError } = await supabase
      .from('subjects')
      .delete()
      .eq('id', subjectId)

    if (subjectDeleteError) {
      setSubjectError(subjectDeleteError.message)
      return
    }

    setRemovedSubjectIds((previous) => previous.filter((id) => id !== subjectId))
    setSubjectDrafts((previous) => previous.filter((row) => row.id !== subjectId))
    setConfirmSubjectDelete(null)
    await loadSubjects()
    await loadDeadlines()
  }

  async function saveSubjectChanges() {
    setSavingSubjects(true)
    setSubjectError('')

    const cleanDrafts = subjectDrafts
      .map((row) => ({ ...row, name: row.name.trim() }))
      .filter((row) => row.name.length > 0)

    const duplicateName = cleanDrafts.find(
      (row, idx) =>
        cleanDrafts.findIndex((candidate) => candidate.name.toLowerCase() === row.name.toLowerCase()) !== idx,
    )

    if (duplicateName) {
      setSubjectError('Subject names must be unique.')
      setSavingSubjects(false)
      return
    }

    if (removedSubjectIds.length > 0) {
      const { error: deadlinesDeleteError } = await supabase
        .from('deadlines')
        .delete()
        .in('subject_id', removedSubjectIds)

      if (deadlinesDeleteError) {
        setSubjectError(deadlinesDeleteError.message)
        setSavingSubjects(false)
        return
      }

      const { error } = await supabase.from('subjects').delete().in('id', removedSubjectIds)
      if (error) {
        setSubjectError(error.message)
        setSavingSubjects(false)
        return
      }
    }

    const existingRows = cleanDrafts.filter((row) => !String(row.id).startsWith('new-'))
    const newRows = cleanDrafts.filter((row) => String(row.id).startsWith('new-'))

    if (existingRows.length > 0) {
      for (const row of existingRows) {
        const { error } = await supabase
          .from('subjects')
          .update({
            name: row.name,
            color_bg: row.color_bg,
            color_text: row.color_text,
          })
          .eq('id', row.id)

        if (error) {
          setSubjectError(error.message)
          setSavingSubjects(false)
          return
        }
      }
    }

    if (newRows.length > 0) {
      const payload = newRows.map((row) => ({
        name: row.name,
        color_bg: row.color_bg,
        color_text: row.color_text,
      }))

      const { error } = await supabase.from('subjects').insert(payload)
      if (error) {
        setSubjectError(error.message)
        setSavingSubjects(false)
        return
      }
    }

    await loadSubjects()
    await loadDeadlines()
    setSavingSubjects(false)
    setSubjectModalOpen(false)
  }

  function handlePageClick(event) {
    const clickedTaskRow = event.target.closest('.deadlines__table tbody tr')
    if (!clickedTaskRow) {
      setSubjectMenuRowId(null)
      setEditingCell(null)
    }
  }

  return (
    <main className="deadlines-page" onClick={handlePageClick}>
      <section className="deadlines">
        <header className="deadlines__header">
          <p className="deadlines__eyebrow">Planner</p>
          <h1 className="deadlines__title">
            Deadlines
            <span className="deadlines__title-squiggle"> board</span>
          </h1>
          <p className="deadlines__subtitle">
            Track each task by subject, see days left at a glance, and keep due
            dates clean and visible.
          </p>
        </header>

        <section className="deadlines__composer" aria-label="New deadline">
          <div className="deadlines__subject-picker">
            <button
              type="button"
              className="deadlines__subject-trigger"
              onClick={() => setSubjectMenuOpen((previous) => !previous)}
            >
              {selectedSubject ? (
                <span
                  className="deadlines__subject-chip"
                  style={{
                    background: selectedSubject.color_bg,
                    color: selectedSubject.color_text,
                  }}
                >
                  {selectedSubject.name}
                </span>
              ) : (
                <span className="deadlines__subject-placeholder">Select subject</span>
              )}
              <span className="deadlines__caret">v</span>
            </button>

            {subjectMenuOpen ? (
              <div className="deadlines__subject-menu" role="menu" aria-label="Subjects list">
                {subjects.length === 0 ? (
                  <p className="deadlines__subject-empty">No subjects yet.</p>
                ) : (
                  <div className="deadlines__subject-list">
                    {subjects.map((subject) => (
                      <button
                        key={subject.id}
                        type="button"
                        className="deadlines__subject-option"
                        onClick={() => {
                          setSelectedSubjectId(subject.id)
                          setSubjectMenuOpen(false)
                        }}
                      >
                        <span
                          className="deadlines__subject-chip"
                          style={{
                            background: subject.color_bg,
                            color: subject.color_text,
                          }}
                        >
                          {subject.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <button type="button" className="deadlines__subject-edit" onClick={openSubjectModal}>
                  Edit subjects
                </button>
              </div>
            ) : null}
          </div>

          <input
            type="text"
            value={taskName}
            onChange={(event) => setTaskName(event.target.value)}
            placeholder="Assignment name"
            aria-label="Task name"
          />
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            aria-label="Due date"
          />
          <button type="button" onClick={handleAddTask} disabled={addingTask}>
            {addingTask ? 'Adding...' : 'Add Task'}
          </button>
        </section>
        {deadlinesError ? <p className="deadlines__status">{deadlinesError}</p> : null}

        <section className="deadlines__table-wrap" aria-label="Task deadlines table">
          <div className="deadlines__table-title">tasks</div>
          <table className="deadlines__table">
            <thead>
              <tr>
                <th>subject</th>
                <th>assignment name</th>
                <th>days left</th>
                <th>due on</th>
              </tr>
            </thead>
            <tbody>
              {deadlinesRows.length === 0 ? (
                <tr>
                  <td className="deadlines__table-empty" colSpan={4}>
                    No tasks yet. Add your first deadline above.
                  </td>
                </tr>
              ) : (
                deadlinesRows.map((item) => (
                  <tr key={item.id}>
                    <td
                      className="deadlines__editable-cell"
                      onClick={(event) => {
                        event.stopPropagation()
                        setSubjectMenuRowId((previous) => (previous === item.id ? null : item.id))
                      }}
                    >
                      <button
                        type="button"
                        className="deadlines__trash-btn"
                        onClick={(event) => {
                          event.stopPropagation()
                          deleteDeadline(item.id)
                        }}
                        aria-label="Delete task"
                      >
                        <img src={trashIcon} alt="" />
                      </button>

                      <span
                        className="deadlines__subject-pill"
                        style={{
                          background: item.color_bg || '#DDDeda',
                          color: item.color_text || '#3D3A32',
                        }}
                      >
                        {item.subject}
                        <span className="deadlines__subject-pill-caret">▾</span>
                      </span>

                      {subjectMenuRowId === item.id ? (
                        <div
                          className="deadlines__subject-menu deadlines__subject-menu--row"
                          role="menu"
                          aria-label="Edit subject"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <div className="deadlines__subject-list">
                            {subjects.map((subject) => (
                              <button
                                key={subject.id}
                                type="button"
                                className="deadlines__subject-option"
                                onClick={async () => {
                                  const ok = await patchDeadline(item.id, { subject_id: subject.id })
                                  if (ok) setSubjectMenuRowId(null)
                                }}
                              >
                                <span
                                  className="deadlines__subject-chip"
                                  style={{
                                    background: subject.color_bg,
                                    color: subject.color_text,
                                  }}
                                >
                                  {subject.name}
                                </span>
                              </button>
                            ))}
                          </div>

                          <button
                            type="button"
                            className="deadlines__subject-edit"
                            onClick={() => {
                              openSubjectModal()
                              setSubjectMenuRowId(null)
                            }}
                          >
                            Edit subjects
                          </button>
                        </div>
                      ) : null}
                    </td>
                    <td
                      className="deadlines__editable-cell"
                      onClick={(event) => {
                        event.stopPropagation()
                        setSubjectMenuRowId(null)
                        setAssignmentDraft(item.assignment_name)
                        setEditingCell({ id: item.id, field: 'assignment_name' })
                      }}
                    >
                      {editingCell?.id === item.id && editingCell?.field === 'assignment_name' ? (
                        <input
                          type="text"
                          className="deadlines__row-input"
                          value={assignmentDraft}
                          onChange={(event) => setAssignmentDraft(event.target.value)}
                          onClick={(event) => event.stopPropagation()}
                          onBlur={async () => {
                            const trimmed = assignmentDraft.trim()
                            if (!trimmed) {
                              setEditingCell(null)
                              return
                            }
                            const ok = await patchDeadline(item.id, { assignment_name: trimmed })
                            if (ok) setEditingCell(null)
                          }}
                          onKeyDown={async (event) => {
                            if (event.key === 'Enter') {
                              const trimmed = assignmentDraft.trim()
                              if (!trimmed) return
                              const ok = await patchDeadline(item.id, { assignment_name: trimmed })
                              if (ok) setEditingCell(null)
                            }
                            if (event.key === 'Escape') {
                              setEditingCell(null)
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        item.assignment_name
                      )}
                    </td>
                    <td
                      className={`deadlines__days-cell ${dayClass(item.days_left)}`}
                    >
                      {item.days_left}
                    </td>
                    <td
                      className="deadlines__editable-cell"
                      onClick={(event) => {
                        event.stopPropagation()
                        setSubjectMenuRowId(null)
                        setEditingCell({ id: item.id, field: 'due_on' })
                        setTimeout(() => {
                          const input = dueInputRefs.current[item.id]
                          if (!input) return
                          if (typeof input.showPicker === 'function') input.showPicker()
                          input.focus()
                        }, 0)
                      }}
                    >
                      {editingCell?.id === item.id && editingCell?.field === 'due_on' ? (
                        <input
                          type="date"
                          className="deadlines__row-input"
                          value={item.due_on}
                          ref={(node) => {
                            dueInputRefs.current[item.id] = node
                          }}
                          onChange={async (event) => {
                            const nextDate = event.target.value
                            if (!nextDate) return
                            const ok = await patchDeadline(item.id, { due_on: nextDate })
                            if (ok) setEditingCell(null)
                          }}
                          onClick={(event) => event.stopPropagation()}
                          onBlur={() => setEditingCell(null)}
                        />
                      ) : (
                        item.due_on_label
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </section>

      {subjectModalOpen ? (
        <div className="deadlines__modal-backdrop" role="presentation">
          <section className="deadlines__modal" aria-label="Edit subjects">
            <header className="deadlines__modal-head">
              <h2>Edit Subjects</h2>
              <button
                type="button"
                className="deadlines__modal-close"
                onClick={() => {
                  setSubjectModalOpen(false)
                  setConfirmSubjectDelete(null)
                }}
              >
                x
              </button>
            </header>

            <div className="deadlines__modal-list">
              {subjectDrafts.map((draft) => (
                <div key={draft.id} className="deadlines__modal-row">
                  <input
                    className="deadlines__color-input"
                    type="color"
                    value={draft.color_bg}
                    aria-label={`Color for ${draft.name || 'subject'}`}
                    onChange={(event) =>
                      updateSubjectDraft(draft.id, { color_bg: event.target.value })
                    }
                  />

                  <input
                    className="deadlines__name-input"
                    type="text"
                    value={draft.name}
                    placeholder="Subject name"
                    onChange={(event) =>
                      updateSubjectDraft(draft.id, { name: event.target.value })
                    }
                  />

                  <button
                    type="button"
                    className="deadlines__delete-btn"
                    onClick={() => removeSubjectDraft(draft)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            {subjectError ? <p className="deadlines__modal-error">{subjectError}</p> : null}

            <div className="deadlines__modal-actions">
              <button type="button" className="deadlines__add-row" onClick={addSubjectDraft}>
                Add another subject
              </button>
              <button
                type="button"
                className="deadlines__save-row"
                onClick={saveSubjectChanges}
                disabled={savingSubjects}
              >
                {savingSubjects ? 'Saving...' : 'Save'}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {confirmSubjectDelete ? (
        <div className="deadlines__confirm-backdrop" role="presentation">
          <section className="deadlines__confirm-modal" aria-label="Confirm subject deletion">
            <h3>Delete subject?</h3>
            <p>
              Deleting <strong>{confirmSubjectDelete.name}</strong> will also delete{' '}
              <strong>{confirmSubjectDelete.count}</strong> linked task(s).
            </p>
            <div className="deadlines__confirm-actions">
              <button
                type="button"
                className="deadlines__confirm-btn"
                onClick={() => setConfirmSubjectDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="deadlines__confirm-btn deadlines__confirm-btn--danger"
                onClick={confirmDeleteSubjectDraft}
              >
                Confirm delete
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  )
}

export default DeadlinesPage
