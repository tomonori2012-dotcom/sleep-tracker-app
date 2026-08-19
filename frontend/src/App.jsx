import { useState, useEffect } from 'react'
import './App.css'

function App() {
    // --- 1. 認証機能用のステート ---
    const [isLoggedIn, setIsLoggedIn] = useState(
        localStorage.getItem('isLoggedIn') === 'true'
    )
    const [loginUser, setLoginUser] = useState('')
    const [loginPass, setLoginPass] = useState('')
    const [loginError, setLoginError] = useState('')

    // --- 2. 睡眠記録アプリ用のステート ---
    const [records, setRecords] = useState([])
    const [date, setDate] = useState('')
    const [hours, setHours] = useState('')
    const [memo, setMemo] = useState('')
    const [editingId, setEditingId] = useState(null)
    const [errorMessage, setErrorMessage] = useState('')
    const [sleepAlert, setSleepAlert] = useState('')

    // 一覧取得 (GET)
    const fetchRecords = () => {
        fetch('http://localhost:8080/api/sleep')
            .then((res) => {
                if (!res.ok) throw new Error('取得エラー')
                return res.json()
            })
            .then((data) => {
                setRecords(data)
                setErrorMessage('')
            })
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

    // ログイン処理
    const handleLogin = (e) => {
        e.preventDefault()
        if (loginUser === 'admin' && loginPass === '1234') {
            setIsLoggedIn(true)
            localStorage.setItem('isLoggedIn', 'true')
            setLoginError('')
        } else {
            setLoginError('ユーザー名またはパスワードが違います')
        }
    }

    // ログアウト処理
    const handleLogout = () => {
        setIsLoggedIn(false)
        localStorage.removeItem('isLoggedIn')
        setLoginUser('')
        setLoginPass('')
    }

    // フォーム入力のリセット
    const resetForm = () => {
        setDate('')
        setHours('')
        setMemo('')
        setEditingId(null)
        setErrorMessage('')
        setSleepAlert('')
    }

    // 保存処理（新規 POST / 更新 PUT）
    const handleSubmit = (e) => {
        e.preventDefault()
        setErrorMessage('')

        const url = editingId
            ? `http://localhost:8080/api/sleep/${editingId}`
            : 'http://localhost:8080/api/sleep'

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

    // 編集モードの開始
    const handleEdit = (item) => {
        setEditingId(item.id)
        setDate(item.date)
        setHours(item.hours)
        setMemo(item.memo)
        handleHoursChange(item.hours)
        setErrorMessage('')
    }

    // 削除処理 (DELETE)
    const handleDelete = (id) => {
        setErrorMessage('')
        fetch(`http://localhost:8080/api/sleep/${id}`, {
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

    // 睡眠ステータス判定用ヘルパー関数
    const getSleepBadge = (h) => {
        if (h < 6) {
            return { text: '⚠️ 睡眠不足', bg: '#FEE2E2', color: '#DC2626' }
        } else if (h > 9) {
            return { text: '⚠️ 不規則/寝すぎ', bg: '#FEF3C7', color: '#D97706' }
        }
        return { text: '✨ 良好', bg: '#DCFCE7', color: '#16A34A' }
    }

    // 未ログイン画面
    if (!isLoggedIn) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div style={{ width: '100%', maxWidth: '380px', padding: '36px 32px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 12px 32px rgba(0, 0, 0, 0.08)', textAlign: 'center', border: '1px solid #f0f0f0' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <span style={{ fontSize: '26px' }}>🌙</span>
                    </div>
                    <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1E293B', margin: '0 0 6px 0' }}>睡眠記録 App</h1>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 28px 0' }}>アカウント情報を入力してログイン</p>

                    {loginError && (
                        <div style={{ padding: '10px', marginBottom: '20px', backgroundColor: '#FEF2F2', color: '#DC2626', borderRadius: '8px', fontSize: '13px' }}>
                            ⚠️ {loginError}
                        </div>
                    )}

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        <input type="text" placeholder="ユーザー名 (admin)" value={loginUser} onChange={(e) => setLoginUser(e.target.value)} required style={{ padding: '11px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                        <input type="password" placeholder="パスワード (1234)" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} required style={{ padding: '11px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                        <button type="submit" style={{ padding: '12px', background: 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>ログイン</button>
                    </form>
                </div>
            </div>
        )
    }

    // ログイン後画面
    return (
        <div style={{ maxWidth: '560px', margin: '30px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>

            {/* ヘッダー */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '12px 20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '20px', border: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>🌙</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>{loginUser || 'admin'}</span>
                </div>
                <button onClick={handleLogout} style={{ padding: '6px 14px', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>ログアウト</button>
            </header>

            {/* フォーム */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px 28px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)', border: '1px solid #f0f0f0', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#1E293B', margin: '0 0 18px 0', textAlign: 'left' }}>
                    {editingId ? '✏️ 記録を編集' : '📝 新しい睡眠を記録'}
                </h1>

                {errorMessage && (
                    <div style={{ padding: '10px 14px', marginBottom: '16px', backgroundColor: '#FEF2F2', color: '#DC2626', borderRadius: '8px', fontSize: '13px', textAlign: 'left' }}>
                        ⚠️ {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ flex: 1, textAlign: 'left' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>日付</label>
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }} />
                        </div>

                        <div style={{ flex: 1, textAlign: 'left' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>睡眠時間 (時間)</label>
                            <input type="number" step="0.1" placeholder="7.5" value={hours} onChange={(e) => handleHoursChange(e.target.value)} required style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }} />
                        </div>
                    </div>

                    {/* 入力中の不規則睡眠アラートメッセージ */}
                    {sleepAlert && (
                        <div style={{ padding: '10px 12px', backgroundColor: '#FFFBEB', color: '#D97706', border: '1px solid #FCD34D', borderRadius: '8px', fontSize: '12px', fontWeight: '600', textAlign: 'left' }}>
                            {sleepAlert}
                        </div>
                    )}

                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>メモ</label>
                        <input type="text" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="例: ぐっすり眠れた" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                        <button type="submit" style={{ flex: 1, padding: '11px', background: editingId ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                            {editingId ? '変更を保存' : '記録を保存'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={resetForm} style={{ padding: '11px 16px', backgroundColor: '#94A3B8', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>キャンセル</button>
                        )}
                    </div>
                </form>
            </div>

            {/* 記録一覧 */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px 28px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)', border: '1px solid #f0f0f0' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1E293B', margin: '0 0 16px 0', textAlign: 'left' }}>📊 過去の記録一覧</h2>

                {records.length === 0 ? (
                    <p style={{ color: '#94A3B8', fontSize: '13px', margin: '15px 0' }}>まだ記録がありません。</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {records.map((item) => {
                            const status = getSleepBadge(item.hours)
                            return (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748B' }}>{item.date}</span>
                                            <span style={{ fontSize: '12px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px', backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
                        {item.hours}時間
                      </span>
                                            {/* 不規則・睡眠不足のアラートバッジ */}
                                            <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px', backgroundColor: status.bg, color: status.color }}>
                        {status.text}
                      </span>
                                        </div>
                                        {item.memo && (
                                            <div style={{ fontSize: '13px', color: '#334155', fontWeight: '500' }}>
                                                {item.memo}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button onClick={() => handleEdit(item)} style={{ padding: '5px 10px', backgroundColor: '#FEF3C7', color: '#D97706', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>編集</button>
                                        <button onClick={() => handleDelete(item.id)} style={{ padding: '5px 10px', backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>削除</button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

        </div>
    )
}

export default App