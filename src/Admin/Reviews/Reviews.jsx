import { useState, useEffect } from 'react'
import Sidebar from '../Sidebar/Sidebar'
import Logout from '../Logout'
import { API_BASE_URL } from '../../../Config'
import '../../App.css'

const Stars = ({ rating, size = 'text-base' }) => (
  <span className={size}>
    {[1,2,3,4,5].map(s => (
      <span key={s} style={{ color: s <= rating ? '#f59e0b' : '#e2e8f0' }}>★</span>
    ))}
  </span>
)

export default function Reviews() {
  const [reviews, setReviews] = useState([])
  const [summary, setSummary] = useState(null)
  const [filterRating, setFilterRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [revRes, sumRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/reviews`),
          fetch(`${API_BASE_URL}/api/reviews/summary`),
        ])
        setReviews(await revRes.json())
        setSummary(await sumRes.json())
      } catch (e) { setError('Failed to load reviews') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const filtered = filterRating === 0 ? reviews : reviews.filter(r => r.rating === filterRating)

  const avgRating = summary ? parseFloat(summary.avg_rating || 0) : 0
  const totalCount = summary ? parseInt(summary.total || 0) : 0

  const ratingBars = [5,4,3,2,1].map(star => ({
    star,
    count: summary ? parseInt(summary[`${['','one','two','three','four','five'][star]}_star`] || 0) : 0,
  }))

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Logout />
      <div className="hundred:ml-64 mobile:ml-0 mobile:px-3 w-auto">
        <div className="mx-auto px-6 py-8 w-full">

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">⭐ Customer Reviews</h1>
            <p className="text-slate-400 mt-1.5 text-sm">All product reviews and gift awards</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 border-l-4 border-l-red-500 text-red-700 px-4 py-3.5 rounded-xl mb-5 text-sm font-medium">⚠️ {error}</div>
          )}

          {/* Summary card */}
          {summary && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-6 flex flex-wrap gap-6 items-center">
              <div className="text-center min-w-[100px]">
                <div className="text-5xl font-extrabold text-amber-500">{avgRating.toFixed(1)}</div>
                <Stars rating={Math.round(avgRating)} size="text-xl" />
                <div className="text-xs text-slate-400 mt-1">{totalCount} review{totalCount !== 1 ? 's' : ''}</div>
              </div>
              <div className="flex-1 min-w-[200px]">
                {ratingBars.map(({ star, count }) => (
                  <div key={star} className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-500 w-4">{star}</span>
                    <span className="text-amber-400 text-sm">★</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-amber-400 transition-all duration-500"
                        style={{ width: totalCount > 0 ? `${(count / totalCount) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-5">{count}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {[0,5,4,3,2,1].map(r => (
                  <button
                    key={r}
                    onClick={() => setFilterRating(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-150
                      ${filterRating === r
                        ? 'bg-amber-500 border-amber-500 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-500'}`}
                  >
                    {r === 0 ? 'All' : `${r} ★`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-16 text-indigo-500 font-semibold">Loading reviews...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
              <div className="text-4xl mb-3">⭐</div>
              <p className="text-slate-400 font-medium text-sm">No reviews yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
              {filtered.map(review => (
                <div key={review.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-sm font-bold text-slate-800">{review.customer_name || 'Anonymous'}</div>
                      <div className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <Stars rating={review.rating} />
                  </div>
                  {review.comment && (
                    <p className="text-sm text-slate-600 mb-3 leading-relaxed">"{review.comment}"</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {review.quotation_id && (
                      <span className="bg-indigo-50 text-indigo-600 border border-indigo-200 text-xs font-bold px-2 py-0.5 rounded-full">
                        📋 {review.quotation_id}
                      </span>
                    )}
                    {review.gift_product && (
                      <span className="bg-purple-50 text-purple-600 border border-purple-200 text-xs font-bold px-2 py-0.5 rounded-full">
                        🎁 {review.gift_product}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
