import { useState, useEffect } from 'react'

function App() {
  const [records, setRecords] = useState([])
  const [date, setDate] = useState('')
  const [hours, setHours] = useState('')
  const [memo, setMemo] = useState('')

  // バックエンドから一覧を取得
  const fetchRecords = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/sleep')
      const data = await res.json()
      setRecords(data)
    } catch (err) {
      console.error('取得失敗:', err)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  // バックエンドへ新規登録
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await fetch('http://localhost:8080/api/sleep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, hours: parseFloat(hours), memo })
      })
      setDate('')
      setHours('')
      setMemo('')
      fetchRecords() // 再読み込み
    } catch (err) {
      console.error('保存失敗:', err)
    }
  }

  return (
      <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto' }}>
        <h1>睡眠記録アプリ</h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
          <div>
            <label style={{ display: 'block' }}>日付:</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </div>
          <div>
            <label style={{ display: 'block' }}>睡眠時間 (時間):</label>
            <input type="number" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </div>
          <div>
            <label style={{ display: 'block' }}>メモ:</label>
            <input type="text" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="例: 途中で目が覚めた" style={{ width: '100%', padding: '8px' }} />
          </div>
          <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            記録を保存
          </button>
        </form>

        <h2>過去の記録一覧</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {records.map((r) => (
              <li key={r.id} style={{ borderBottom: '1px solid #ccc', padding: '10px 0' }}>
                <strong>{r.date}</strong> : {r.hours}時間 {r.memo && `(${r.memo})`}
              </li>
          ))}
        </ul>
      </div>
  )
}

export default App