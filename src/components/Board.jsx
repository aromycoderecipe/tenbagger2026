import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import MarqueeBand from './MarqueeBand'
import './Board.css'

const POSTS_PER_PAGE = 4
const POSTS_TABLE = 'posts0708'

function emptyForm() {
  return { title: '', content: '' }
}

function formatDate(isoString) {
  if (!isoString) return ''
  return isoString.slice(0, 10)
}

export default function Board({ showMarquee = false }) {
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [currentPage, setCurrentPage] = useState(1)

  // Read — fetch posts from Supabase once on mount, reflect into state.
  useEffect(() => {
    let isCancelled = false

    async function fetchPosts() {
      setIsLoading(true)
      setLoadError(null)

      try {
        const { data, error } = await supabase
          .from(POSTS_TABLE)
          .select('id, created_at, title, content')
          .order('created_at', { ascending: false })

        if (isCancelled) return

        if (error) {
          setLoadError(error.message)
        } else {
          setPosts(data ?? [])
        }
      } catch (err) {
        if (!isCancelled) setLoadError(err.message)
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    fetchPosts()

    return () => {
      isCancelled = true
    }
  }, [])

  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE))
  const pageStart = (currentPage - 1) * POSTS_PER_PAGE
  const visiblePosts = posts.slice(pageStart, pageStart + POSTS_PER_PAGE)

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages))
  }

  const openWriteForm = () => {
    setEditingId(null)
    setSubmitError(null)
    setForm(emptyForm())
    setIsFormOpen(true)
  }

  const openEditForm = (post) => {
    setEditingId(post.id)
    setSubmitError(null)
    setForm({ title: post.title, content: post.content })
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingId(null)
    setSubmitError(null)
    setForm(emptyForm())
  }

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  // Create / Update — insert or update in Supabase, then reflect the result into state.
  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.title.trim() || !form.content.trim() || isSubmitting) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      if (editingId !== null) {
        const { data, error } = await supabase
          .from(POSTS_TABLE)
          .update({ title: form.title, content: form.content })
          .eq('id', editingId)
          .select('id, created_at, title, content')

        if (error) {
          setSubmitError(error.message)
          return
        }

        const [updatedPost] = data
        setPosts((prev) => prev.map((post) => (post.id === editingId ? updatedPost : post)))
      } else {
        const { data, error } = await supabase
          .from(POSTS_TABLE)
          .insert([{ title: form.title, content: form.content }])
          .select('id, created_at, title, content')

        if (error) {
          setSubmitError(error.message)
          return
        }

        const [newPost] = data
        setPosts((prev) => [newPost, ...prev])
        setCurrentPage(1)
      }

      closeForm()
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete — remove from Supabase, then drop it from state and re-clamp the current page.
  const handleDelete = async (id) => {
    setDeleteError(null)
    setDeletingId(id)

    try {
      const { error } = await supabase.from(POSTS_TABLE).delete().eq('id', id)

      if (error) {
        setDeleteError(error.message)
        return
      }

      setPosts((prev) => {
        const next = prev.filter((post) => post.id !== id)
        const nextTotalPages = Math.max(1, Math.ceil(next.length / POSTS_PER_PAGE))
        setCurrentPage((page) => Math.min(page, nextTotalPages))
        return next
      })
      if (editingId === id) closeForm()
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="board">
      {showMarquee && <MarqueeBand />}
      <div className="board-header">
        <h2 className="board-title">게시판</h2>
        <button type="button" className="btn btn-primary" onClick={openWriteForm}>
          글쓰기
        </button>
      </div>

      {isFormOpen && (
        <form className="board-form" onSubmit={handleSubmit}>
          <input
            className="board-input"
            type="text"
            placeholder="제목을 입력하세요"
            value={form.title}
            onChange={handleChange('title')}
            autoFocus
          />
          <textarea
            className="board-textarea"
            placeholder="본문을 입력하세요"
            rows={4}
            value={form.content}
            onChange={handleChange('content')}
          />
          {submitError && <p className="board-error">저장에 실패했습니다: {submitError}</p>}
          <div className="board-form-actions">
            <button type="button" className="btn btn-secondary" onClick={closeForm}>
              취소
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? '저장 중…' : editingId !== null ? '수정 완료' : '등록'}
            </button>
          </div>
        </form>
      )}

      {isLoading && <p className="board-status">게시글을 불러오는 중…</p>}

      {!isLoading && loadError && (
        <p className="board-error">게시글을 불러오지 못했습니다: {loadError}</p>
      )}

      {!isLoading && !loadError && (
        <>
          {deleteError && <p className="board-error">삭제에 실패했습니다: {deleteError}</p>}

          <ul className="board-list">
            {visiblePosts.length === 0 && (
              <li className="board-empty">등록된 게시글이 없습니다.</li>
            )}
            {visiblePosts.map((post) => (
              <li className="board-card" key={post.id}>
                <div className="board-card-body">
                  <h3 className="board-card-title">{post.title}</h3>
                  <p className="board-card-meta">{formatDate(post.created_at)}</p>
                  <p className="board-card-content">{post.content}</p>
                </div>
                <div className="board-card-actions">
                  <button type="button" className="btn-text" onClick={() => openEditForm(post)}>
                    수정
                  </button>
                  <button
                    type="button"
                    className="btn-text btn-text-danger"
                    onClick={() => handleDelete(post.id)}
                    disabled={deletingId === post.id}
                  >
                    {deletingId === post.id ? '삭제 중…' : '삭제'}
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <nav className="board-pagination" aria-label="게시판 페이지 이동">
              <button
                type="button"
                className="board-pagination-btn"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="이전 페이지"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  className={
                    page === currentPage
                      ? 'board-pagination-btn board-pagination-btn--active'
                      : 'board-pagination-btn'
                  }
                  onClick={() => goToPage(page)}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                className="board-pagination-btn"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="다음 페이지"
              >
                ›
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  )
}
