import { useState, useEffect } from 'react'
import './App.css'

// バックエンド（Render）の公開URL
const API_BASE_URL = 'https://sleep-tracker-backend-xfez.onrender.com';

function App() {
    // 1. 認証機能用のステート
    const [isLoggedIn, setIsLoggedIn] = useState(
        localStorage.getItem('isLoggedIn') === 'true'
    )
    const [loginUser, setLoginUser] = useState('')
    const [loginPass, setLoginPass] = useState('')
    const [loginError, setLoginError] = useState('')

    // 2. 睡眠記録アプリ用のステート
    const [records, setRecords] = useState([])
    const [date, setDate] = useState('')
    const [hours, setHours] = useState('')
    const [memo, setMemo] = useState('')
    const [editingId, setEditingId] = useState(null)
    const [errorMessage, setErrorMessage] = useState('')
    const [sleepAlert, setSleepAlert] = useState('')

    // ステータスバッジ判定用関数
    const getStatus = (hoursNum) => {
        const num = parseFloat(hoursNum)
        if (num < 6) {
            return { text: '⚠️ 睡眠不足', bg: '#FEE2E2', color: '#DC2626' }
        } else if (num > 9) {
            return { text: '⚠️ 寝すぎ注意', bg: '#FEF3C7', color: '#D97706' }
        }
        return { text: '✨ 良好', bg: '#DCFCE7', color: '#166534' }
    }

    // 一覧取得 (GET)
    const fetchRecords = () => {
        fetch(`${API_BASE_URL}/api/sleep`)
            .then((res) => {
                if (!res.ok) throw new Error('取得エラー')
                return res.json()
            })
            .then((data) => setRecords(data))
            .catch((err) => {
                console.error(err)
                setErrorMessage('データの取得に失敗しました。')
            })
    }

    useEffect(() => {
        if (isLoggedIn) {
            fetchRecords()
        }
    }, [isLoggedIn])

    // 睡眠時間のリアルタイム判定アラート
    const handleHoursChange = (val) => {
        setHours(val)
        const num = parseFloat(val)
        if (!isNaN(num)) {
            if (num < 6) {
                setSleepAlert('⚠️ 睡眠時間が少なめです。体調にご注意ください！')
            } else if (num > 9) {
                setSleepAlert('⚠️ 睡眠時間が長めです。リズムの乱れにご注意ください。')
            } else {
                setSleepAlert('')
            }
        } else {
            setSleepAlert('')
        }
    }

    // フォームリセット
    const resetForm = () => {
        setDate('')
        setHours('')
        setMemo('')
        setEditingId(null)
        setSleepAlert('')
    }

    // 保存処理 (新規 POST / 更新 PUT)
    const handleSubmit = (e) => {
        e.preventDefault()
        setErrorMessage('')

        const url = editingId
            ? `${API_BASE_URL}/api/sleep/${editingId}`
            : `${API_BASE_URL}/api/sleep`

        const method = editingId ? 'PUT' : 'POST'

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, hours: parseFloat(hours), memo }),
        })
            .then((res) => {
                if (!res.ok) throw new Error('保存エラー')
                resetForm()
                fetchRecords()
            })
            .catch((err) => {
                console.error(err)
                setErrorMessage('保存に失敗しました。')
            })
    }

    // 編集モードへのセット
    const handleEdit = (item) => {
        setEditingId(item.id)
        setDate(item.date)
        setHours(item.hours)
        setMemo(item.memo || '')
        handleHoursChange(item.hours)
        setErrorMessage('')
    }

    // 削除処理 (DELETE)
    const handleDelete = (id) => {
        setErrorMessage('')
        fetch(`${API_BASE_URL}/api/sleep/${id}`, {
            method: 'DELETE',
        })
            .then((res) => {
                if (!res.ok) throw new Error('削除エラー')
                fetchRecords()
            })
            .catch((err) => {
                console.error(err)
                setErrorMessage('削除に失敗しました。')
            })
    }

    // ログイン処理
    const handleLogin = (e) => {
        e.preventDefault()
        if (loginUser && loginPass) {
            setIsLoggedIn(true)
            localStorage.setItem('isLoggedIn', 'true')
            setLoginError('')
        } else {
            setLoginError('ユーザー名とパスワードを入力してください。')
        }
    }

    // ログアウト処理
    const handleLogout = () => {
        setIsLoggedIn(false)
        localStorage.removeItem('isLoggedIn')
    }

    return (
        <div style={{ padding: '24px', maxWidth: '520px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            {!isLoggedIn ? (
                <div style={{ padding: '24px', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <h2 style={{ color: '#1E293B', marginBottom: '16px' }}>ログイン</h2>
                    {loginError && <p style={{ color: '#DC2626', fontSize: '14px' }}>{loginError}</p>}
                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '12px' }}>
                            <input
                                type="text"
                                placeholder="ユーザー名"
                                value={loginUser}
                                onChange={(e) => setLoginUser(e.target.value)}
                                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <input
                                type="password"
                                placeholder="パスワード"
                                value={loginPass}
                                onChange={(e) => setLoginPass(e.target.value)}
                                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                            />
                        </div>
                        <button
                            type="submit"
                            style={{ padding: '8px 16px', backgroundColor: '#4F46E5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                        >
                            ログイン
                        </button>
                    </form>
                </div>
            ) : (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h1 style={{ fontSize: '22px', color: '#0F172A', margin: 0 }}>🌙 睡眠記録アプリ</h1>
                        <button
                            onClick={handleLogout}
                            style={{ padding: '6px 12px', backgroundColor: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                        >
                            ログアウト
                        </button>
                    </div>

                    {errorMessage && <p style={{ color: '#DC2626', fontSize: '13px', marginBottom: '10px' }}>{errorMessage}</p>}

                    {/* 入力フォーム */}
                    <form onSubmit={handleSubmit} style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '4px', fontWeight: '600' }}>日付</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '4px', fontWeight: '600' }}>睡眠時間 (時間)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={hours}
                                onChange={(e) => handleHoursChange(e.target.value)}
                                required
                                placeholder="例: 7.5"
                                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                            />
                            {sleepAlert && <p style={{ color: '#D97706', fontSize: '12px', marginTop: '4px' }}>{sleepAlert}</p>}
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '4px', fontWeight: '600' }}>メモ</label>
                            <input
                                type="text"
                                value={memo}
                                onChange={(e) => setMemo(e.target.value)}
                                placeholder="体調や目覚めの感覚など"
                                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                type="submit"
                                style={{ flex: 1, padding: '10px', backgroundColor: '#4F46E5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                            >
                                {editingId ? '更新する' : '記録を保存'}
                            </button>
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    style={{ padding: '10px 14px', backgroundColor: '#E2E8F0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                    キャンセル
                                </button>
                            )}
                        </div>
                    </form>

                    {/* 記録一覧 */}
                    <h2 style={{ fontSize: '16px', color: '#1E293B', marginBottom: '12px' }}>記録一覧</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {records.map((item) => {
                            const status = getStatus(item.hours)
                            return (
                                <div
                                    key={item.id}
                                    style={{
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: '1px solid #E2E8F0',
                                        backgroundColor: '#FFFFFF',
                                        display: 'flex',
                                        justify: 'space-between',
                                        alignItems: 'center',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                    }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <strong style={{ fontSize: '14px', color: '#1E293B' }}>{item.date}</strong>
                                            <span style={{ fontSize: '12px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px', backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
                        {item.hours} 時間
                      </span>
                                            <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px', backgroundColor: status.bg, color: status.color }}>
                        {status.text}
                      </span>
                                        </div>
                                        {item.memo && <div style={{ fontSize: '13px', color: '#334155', fontWeight: '500' }}>{item.memo}</div>}
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button
                                            onClick={() => handleEdit(item)}
                                            style={{ padding: '5px 10px', backgroundColor: '#FEF3C7', color: '#D97706', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                                        >
                                            編集
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            style={{ padding: '5px 10px', backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                                        >
                                            削除
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default App