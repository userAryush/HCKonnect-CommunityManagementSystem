import { useEffect, useState } from 'react'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'


function CommunityShowcase() {

  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/communities/communities-list/`)
      .then((res) => {
        setCommunities(res.data || [])
      })
      .finally(() => setLoading(false))
  }, [])
  return (
    <section id="communities" className="bg-[#f5f8f2] px-4 py-20">
      <div className="mx-auto w-full max-w-6xl">
        <header className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#75C043]">Community showcase</p>
          <h2 className="mt-3 text-3xl font-semibold text-[#0d1f14] sm:text-4xl">
            Built for every type of student-led group.
          </h2>
        </header>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {loading ? (
            <p className="mt-12 text-center text-sm text-[#4b4b4b]">Loading communities…</p>
          ) : (
            communities.map((c) => (
              <article
                key={c.id}
                className="flex flex-col justify-between rounded-3xl border border-[#e2e8d8] bg-white/80 p-6 shadow-xl shadow-[#000]/5 transition hover:-translate-y-1"
              >
                <div>
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#75C043] bg-white shadow-sm">
                    {c.community_logo ? (
                      <img
                        src={c.community_logo}
                        alt={c.community_name}
                        className="h-10 w-10 rounded-full object-contain"
                      />
                    ) : (
                      <span className="text-sm font-bold text-[#75C043]">
                        {c.community_name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-6 text-2xl font-semibold text-[#0f1f15]">
                    {c.community_name}
                  </h3>

                  <p className="mt-2 text-sm text-[#4b4b4b]">
                    {c.community_description}
                  </p>
                </div>

                <button className="mt-6 w-max rounded-full border border-[#0f1f15]/10 px-5 py-2 text-sm font-semibold text-[#0f1f15] transition hover:border-[#75C043] hover:text-[#75C043]">
                  View Community
                </button>
              </article>

            )))}
        </div>
      </div>
    </section>
  )
}

export default CommunityShowcase

