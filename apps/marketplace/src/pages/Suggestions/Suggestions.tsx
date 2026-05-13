import { useState, useRef } from 'react'
import { useApp } from '../../context/AppContext'
import { uploadFile } from '../../shared/api/uploads'
import styles from './Suggestions.module.css'

const EmptyBoxIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
)

const UploadIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

const ThumbsUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
)

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export default function Suggestions() {
  const { suggestions, isLoadingSuggestions, addSuggestion, toggleVote, showToast } = useApp()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [votingId, setVotingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  function handleRemoveImage() {
    setImageFile(null)
    setImagePreview(null)
    setUploadError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit() {
    if (!name.trim()) return
    setIsSubmitting(true)
    setUploadError(null)

    try {
      let imageUrl: string | undefined
      if (imageFile) {
        const result = await uploadFile(imageFile)
        imageUrl = result.url
      }
      await addSuggestion(name.trim(), description.trim(), imageUrl)
      setName('')
      setDescription('')
      handleRemoveImage()
    } catch (err: any) {
      setUploadError(err.message || 'Failed to submit suggestion. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleVote(id: string) {
    if (votingId) return // prevent double-tap
    setVotingId(id)
    try {
      await toggleVote(id)
      // Check if user just voted (not un-voted) — show toast
      const suggestion = suggestions.find(s => s.id === id)
      if (suggestion && !suggestion.hasVoted) {
        showToast('Your vote has been counted!', 'success')
      }
    } catch (_) {
      // silently ignore — the context / backend error is sufficient
    } finally {
      setVotingId(null)
    }
  }

  function handleClear() {
    setName('')
    setDescription('')
    handleRemoveImage()
  }

  return (
    <main className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Suggested Items</h1>
          <span className={styles.countBadge}>{suggestions.length}</span>
        </div>
        <p className={styles.subtitle}>View suggested items and recommend new items.</p>
      </div>

      <div className={styles.columns}>
        {/* Left: Demand chart */}
        <div className={styles.demandCard}>
          <h2 className={styles.demandTitle}>Item Demand Chart</h2>

          {isLoadingSuggestions ? (
            <div className={styles.demandEmpty}>
              <p className={styles.demandEmptySub}>Loading suggestions…</p>
            </div>
          ) : suggestions.length === 0 ? (
            <div className={styles.demandEmpty}>
              <EmptyBoxIcon />
              <p className={styles.demandEmptyTitle}>No Frequent Item Suggestions</p>
              <p className={styles.demandEmptySub}>Item demand chart would appear here</p>
            </div>
          ) : (
            <div className={styles.suggestionList}>
              {suggestions.map((s, i) => (
                <div key={s.id} className={styles.suggestionItem}>
                  {/* Rank */}
                  <span className={`${styles.rank} ${i < 3 ? styles.rankTop : ''}`}>
                    {i + 1}
                  </span>

                  {/* Thumbnail */}
                  {s.imageUrl ? (
                    <img src={s.imageUrl} alt={s.title} className={styles.suggestionImage} />
                  ) : (
                    <div className={styles.suggestionImagePlaceholder}>
                      {s.title.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Info */}
                  <div className={styles.suggestionInfo}>
                    <span className={styles.suggestionName}>{s.title}</span>
                    {s.description && (
                      <span className={styles.suggestionDesc}>{s.description}</span>
                    )}
                    <span className={styles.suggestionMeta}>
                      by {s.user.firstName} {s.user.lastName}
                    </span>
                  </div>

                  {/* Vote section */}
                  <div className={styles.voteSection}>
                    <span className={styles.voteCount}>{s.voteCount}</span>

                    {s.isOwner ? (
                      <span className={styles.ownerBadge} title="Your suggestion">
                        <CheckIcon /> Yours
                      </span>
                    ) : s.hasVoted ? (
                      <button
                        className={`${styles.voteBtn} ${styles.voteBtnVoted}`}
                        onClick={() => handleVote(s.id)}
                        disabled={votingId === s.id}
                        title="Click to remove vote"
                      >
                        <ThumbsUpIcon />
                        {votingId === s.id ? '…' : 'Voted'}
                      </button>
                    ) : (
                      <button
                        className={styles.voteBtn}
                        onClick={() => handleVote(s.id)}
                        disabled={votingId === s.id}
                        title="Vote for this suggestion"
                      >
                        <ThumbsUpIcon />
                        {votingId === s.id ? '…' : 'Vote'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Suggest form */}
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Suggest Item</h2>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Item Name <span className={styles.required}>*</span>
            </label>
            <input
              className={styles.input}
              type="text"
              placeholder="E.g Cereal, Perfume"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description</label>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              placeholder="Add more details about the item"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Upload Image (Optional)</label>

            {imagePreview ? (
              <div className={styles.previewWrapper}>
                <img src={imagePreview} alt="Preview" className={styles.previewImage} />
                <button
                  type="button"
                  className={styles.removeImageBtn}
                  onClick={handleRemoveImage}
                  title="Remove image"
                >
                  <XIcon />
                </button>
              </div>
            ) : (
              <div
                className={styles.uploadArea}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
              >
                <UploadIcon />
                <span className={styles.uploadText}>Click to select an image</span>
                <span className={styles.uploadHint}>JPG, PNG, WEBP up to 5MB</span>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {uploadError && (
              <p style={{ color: '#b91c1c', fontSize: '13px', marginTop: '6px' }}>
                {uploadError}
              </p>
            )}
          </div>

          <div className={styles.formActions}>
            <button className={styles.clearBtn} onClick={handleClear} disabled={isSubmitting}>
              Clear
            </button>
            <button
              className={`${styles.submitBtn} ${name.trim() ? styles.active : ''}`}
              onClick={handleSubmit}
              disabled={!name.trim() || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
