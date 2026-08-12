import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [records, setRecords] = useState([])
  const [date, setDate] = useState('')
  const [hours, setHours] = useState('')
  const [memo, setMemo] = useState('')

  // 一覧取得 (GET)
  const fetchRecords = () => {
    fetch('http://localhost:8080/api/sleep')
        .then((res) => res.json())
        .then((data) => setRecords(data))
        .catch((err) => console.error(err))
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  // 新規登録 (POST)
  const handleSubmit = (e) => {
    e.preventDefault()
    fetch('http://localhost:8080/api/sleep', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, hours: parseFloat(hours), memo }),
    })
        .then(() => {
          setDate('')
          setHours('')
          setMemo('')
          fetchRecords()
        })
        .catch((err) => console.error(err))
  }

  // 削除処理 (DELETE)
  const handleDelete = (id) => {
    fetch(`http://localhost:8080/api/sleep/${id}`, {
      method: 'DELETE',
    })
        .then(() => {
          fetchRecords()
        })
        .catch((err) => console.error(err))
  }

  return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
        <h1>睡眠記録アプリ</h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
          <label>
            日付:
            <br />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </label>
          <label>
            睡眠時間 (時間):
            <br />
            <input type="number" step="0.1" value={hours} onChange={(e) => setHours(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </label>
          <label>
            メモ:
            <br />
            <input type="text" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="例: ぐっすり眠れた" style={{ width: '100%', padding: '8px' }} />
          </label>
          <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            記録を保存
          </button>
        </form>

        <h2>過去の記録一覧</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {records.map((item) => (
              <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '10px 0', padding: '10px', borderBottom: '1px solid #ccc' }}>
            <span>
              {item.date} : {item.hours}時間 ({item.memo})
            </span>
                <button
                    onClick={() => handleDelete(item.id)}
                    style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  削除
                </button>
              </li>
          ))}
        </ul>
      </div>
  )
}

export default App