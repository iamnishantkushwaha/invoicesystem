import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const createEmptyItem = (metal = 'gold') => ({
  description: '',
  metal,
  weight: '',
  rate: '',
  makingCharges: '',
  gstPercent: '',
})

const emptyInvoiceForm = () => ({
  firmId: '',
  invoiceTypeId: '',
  metalType: 'gold',
  customerName: '',
  customerPhone: '',
  items: [createEmptyItem('gold')],
})

const getSavedValue = (key) => {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(key)
  return raw ? JSON.parse(raw) : null
}

function App() {
  const [authMode, setAuthMode] = useState('login')
  const [token, setToken] = useState(() => {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem('invoice_token') ?? ''
  })
  const [user, setUser] = useState(() => getSavedValue('invoice_user'))
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [firmForm, setFirmForm] = useState({ name: '', address: '', gstNumber: '' })
  const [firms, setFirms] = useState([])
  const [invoiceTypes, setInvoiceTypes] = useState([])
  const [invoiceForm, setInvoiceForm] = useState(emptyInvoiceForm())
  const [invoices, setInvoices] = useState([])
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState({ auth: false, firms: false, invoice: false, invoices: false })

  const isAuthenticated = Boolean(token)

  useEffect(() => {
    if (token) {
      localStorage.setItem('invoice_token', token)
    } else {
      localStorage.removeItem('invoice_token')
    }
  }, [token])

  useEffect(() => {
    if (user) {
      localStorage.setItem('invoice_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('invoice_user')
    }
  }, [user])

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/invoice-types`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Unable to load invoice types')
        setInvoiceTypes(data)
      } catch (error) {
        handleStatus(error.message, 'error')
      }
    }

    fetchTypes()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchFirms()
      fetchInvoices()
    } else {
      setFirms([])
      setInvoices([])
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (firms.length && !invoiceForm.firmId) {
      setInvoiceForm((prev) => ({ ...prev, firmId: firms[0]._id }))
    }
  }, [firms])

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}

  const handleStatus = (message, type = 'success') => {
    setStatus({ message, type })
    setTimeout(() => setStatus(null), 4500)
  }

  const loginViaAPI = async ({ email, password }, { showStatus = true } = {}) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Login failed')
    setToken(data.token)
    setUser(data.user)
    if (showStatus) {
      handleStatus('Login successful', 'success')
    }
  }

  const fetchFirms = async () => {
    setLoading((prev) => ({ ...prev, firms: true }))
    try {
      const res = await fetch(`${API_BASE}/api/firms`, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Unable to load firms')
      setFirms(data)
    } catch (error) {
      handleStatus(error.message, 'error')
    } finally {
      setLoading((prev) => ({ ...prev, firms: false }))
    }
  }

  const fetchInvoices = async () => {
    setLoading((prev) => ({ ...prev, invoices: true }))
    try {
      const res = await fetch(`${API_BASE}/api/invoices`, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Unable to load invoices')
      setInvoices(data)
    } catch (error) {
      handleStatus(error.message, 'error')
    } finally {
      setLoading((prev) => ({ ...prev, invoices: false }))
    }
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoading((prev) => ({ ...prev, auth: true }))
    try {
      await loginViaAPI(loginForm)
      setLoginForm({ email: '', password: '' })
    } catch (error) {
      handleStatus(error.message, 'error')
    } finally {
      setLoading((prev) => ({ ...prev, auth: false }))
    }
  }

  const handleSignup = async (event) => {
    event.preventDefault()
    setLoading((prev) => ({ ...prev, auth: true }))
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Signup failed')

      const credentials = { email: signupForm.email, password: signupForm.password }
      setSignupForm({ name: '', email: '', password: '', phone: '' })
      await loginViaAPI(credentials, { showStatus: false })
      handleStatus('Signup complete and signed in', 'success')
    } catch (error) {
      handleStatus(error.message, 'error')
    } finally {
      setLoading((prev) => ({ ...prev, auth: false }))
    }
  }

  const handleLogout = () => {
    setToken('')
    setUser(null)
    handleStatus('Logged out', 'success')
  }

  const handleFirmSubmit = async (event) => {
    event.preventDefault()
    setLoading((prev) => ({ ...prev, firms: true }))
    try {
      const res = await fetch(`${API_BASE}/api/firms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(firmForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Unable to save firm')
      setFirmForm({ name: '', address: '', gstNumber: '' })
      await fetchFirms()
      handleStatus('Firm saved', 'success')
    } catch (error) {
      handleStatus(error.message, 'error')
    } finally {
      setLoading((prev) => ({ ...prev, firms: false }))
    }
  }

  const computedItems = useMemo(() => {
    return invoiceForm.items.map((item) => {
      const weight = parseFloat(item.weight) || 0
      const rate = parseFloat(item.rate) || 0
      const making = parseFloat(item.makingCharges) || 0
      const gstPercent = parseFloat(item.gstPercent) || 0
      const base = weight * rate + making
      const gst = (base * gstPercent) / 100
      const total = parseFloat((base + gst).toFixed(2))
      return { ...item, metal: item.metal || invoiceForm.metalType, weight, rate, makingCharges: making, gstPercent, total }
    })
  }, [invoiceForm])

  const subTotal = useMemo(() => {
    return computedItems.reduce((sum, item) => sum + item.total, 0)
  }, [computedItems])

  const grandTotal = useMemo(() => subTotal, [subTotal])

  const invoiceTypeNames = useMemo(() => {
    const map = {}
    invoiceTypes.forEach((type) => {
      map[type._id] = type.name
    })
    return map
  }, [invoiceTypes])

  const updateInvoiceField = (field, value) => {
    setInvoiceForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'metalType') {
        next.items = next.items.map((item) =>
          value === 'both' ? item : { ...item, metal: value },
        )
      }
      return next
    })
  }

  const handleInvoiceSubmit = async (event) => {
    event.preventDefault()
    setLoading((prev) => ({ ...prev, invoice: true }))
    try {
      if (!invoiceForm.firmId) {
        throw new Error('Select a firm before creating an invoice')
      }
      if (!invoiceForm.invoiceTypeId) {
        throw new Error('Choose an invoice type')
      }

      const normalizedItems = computedItems.map((item) => ({
        description: item.description,
        metal: item.metal,
        weight: item.weight,
        rate: item.rate,
        makingCharges: item.makingCharges,
        gstPercent: item.gstPercent,
        total: item.total,
      }))

      const payload = {
        ...invoiceForm,
        items: normalizedItems,
        subTotal,
        grandTotal,
      }

      const res = await fetch(`${API_BASE}/api/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Unable to create invoice')
      setInvoiceForm(emptyInvoiceForm())
      await fetchInvoices()
      handleStatus('Invoice created', 'success')
    } catch (error) {
      handleStatus(error.message, 'error')
    } finally {
      setLoading((prev) => ({ ...prev, invoice: false }))
    }
  }

  const updateItemField = (index, field, value) => {
    setInvoiceForm((prev) => {
      const nextItems = [...prev.items]
      nextItems[index] = { ...nextItems[index], [field]: value }
      return { ...prev, items: nextItems }
    })
  }

  const addItem = () => {
    setInvoiceForm((prev) => ({ ...prev, items: [...prev.items, createEmptyItem(prev.metalType)] }))
  }

  const removeItem = (index) => {
    setInvoiceForm((prev) => {
      if (prev.items.length === 1) return prev
      const nextItems = prev.items.filter((_, idx) => idx !== index)
      return { ...prev, items: nextItems }
    })
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Invoice System</h1>
        <p className="muted">Connects to the backend APIs for firms, invoice types, and invoices</p>
        {status && <div className={`status-message ${status.type}`}>{status.message}</div>}
      </header>

      <main className="app-grid">
        <section className="panel">
          <div className="panel-header">
            <h2>Authentication</h2>
            {isAuthenticated && user && (
              <div className="user-pill">
                <strong>{user.name}</strong>
                <button className="ghost" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
          {!isAuthenticated ? (
            <div className="auth-wrapper">
              <div className="auth-tabs">
                <button className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>
                  Login
                </button>
                <button className={authMode === 'signup' ? 'active' : ''} onClick={() => setAuthMode('signup')}>
                  Signup
                </button>
              </div>
              {authMode === 'login' ? (
                <form className="auth-form" onSubmit={handleLogin}>
                  <label>
                    Email
                    <input type="email" value={loginForm.email} onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })} required />
                  </label>
                  <label>
                    Password
                    <input type="password" value={loginForm.password} onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })} required />
                  </label>
                  <button type="submit" disabled={loading.auth}>
                    {loading.auth ? 'Checking...' : 'Log in'}
                  </button>
                </form>
              ) : (
                <form className="auth-form" onSubmit={handleSignup}>
                  <label>
                    Name
                    <input type="text" value={signupForm.name} onChange={(event) => setSignupForm({ ...signupForm, name: event.target.value })} required />
                  </label>
                  <label>
                    Email
                    <input type="email" value={signupForm.email} onChange={(event) => setSignupForm({ ...signupForm, email: event.target.value })} required />
                  </label>
                  <label>
                    Phone
                    <input type="tel" value={signupForm.phone} onChange={(event) => setSignupForm({ ...signupForm, phone: event.target.value })} required />
                  </label>
                  <label>
                    Password
                    <input type="password" value={signupForm.password} onChange={(event) => setSignupForm({ ...signupForm, password: event.target.value })} required />
                  </label>
                  <button type="submit" disabled={loading.auth}>
                    {loading.auth ? 'Saving...' : 'Create account'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <p className="muted">You're signed in and can create firms and invoices.</p>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Firms</h2>
            <span className="muted">Create a firm and pick one to attach to invoices</span>
          </div>
          {isAuthenticated ? (
            <>
              <form className="grid-form" onSubmit={handleFirmSubmit}>
                <label>
                  Firm name
                  <input type="text" value={firmForm.name} onChange={(event) => setFirmForm({ ...firmForm, name: event.target.value })} required />
                </label>
                <label>
                  Address
                  <input type="text" value={firmForm.address} onChange={(event) => setFirmForm({ ...firmForm, address: event.target.value })} required />
                </label>
                <label>
                  GST number
                  <input type="text" value={firmForm.gstNumber} onChange={(event) => setFirmForm({ ...firmForm, gstNumber: event.target.value })} required />
                </label>
                <button type="submit" disabled={loading.firms}>
                  {loading.firms ? 'Saving...' : 'Save firm'}
                </button>
              </form>
              <div className="firm-cards">
                {firms.length ? (
                  firms.map((firm) => (
                    <article
                      key={firm._id}
                      className={`firm-card ${invoiceForm.firmId === firm._id ? 'selected' : ''}`}
                      onClick={() => updateInvoiceField('firmId', firm._id)}
                    >
                      <p className="firm-name">{firm.name}</p>
                      <p>{firm.address}</p>
                      <p>GST: {firm.gstNumber}</p>
                    </article>
                  ))
                ) : (
                  <p className="muted">No firms saved yet</p>
                )}
              </div>
            </>
          ) : (
            <p className="muted">Sign in to create and manage firms.</p>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Create Invoice</h2>
            <span className="muted">Invoice numbers are generated server-side.</span>
          </div>
          {isAuthenticated ? (
            <form className="invoice-form" onSubmit={handleInvoiceSubmit}>
              <label>
                Select firm
                <select value={invoiceForm.firmId} onChange={(event) => updateInvoiceField('firmId', event.target.value)} required>
                  <option value="">Pick a firm</option>
                  {firms.map((firm) => (
                    <option value={firm._id} key={firm._id}>
                      {firm.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="two-column">
                <label>
                  Invoice type
                  <select value={invoiceForm.invoiceTypeId} onChange={(event) => updateInvoiceField('invoiceTypeId', event.target.value)} required>
                    <option value="">Select type</option>
                    {invoiceTypes.map((type) => (
                      <option key={type._id} value={type._id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Metal type
                  <select value={invoiceForm.metalType} onChange={(event) => updateInvoiceField('metalType', event.target.value)}>
                    <option value="gold">Gold</option>
                    <option value="silver">Silver</option>
                    <option value="both">Both</option>
                  </select>
                </label>
                <label>
                  Customer name
                  <input type="text" value={invoiceForm.customerName} onChange={(event) => updateInvoiceField('customerName', event.target.value)} required />
                </label>
                <label>
                  Customer phone
                  <input type="tel" value={invoiceForm.customerPhone} onChange={(event) => updateInvoiceField('customerPhone', event.target.value)} />
                </label>
              </div>

              <div className="items-section">
                <header>
                  <h3>Items</h3>
                  <button type="button" className="ghost" onClick={addItem}>
                    + Add item
                  </button>
                </header>
                {computedItems.map((item, index) => (
                  <article key={index} className="item-card">
                    <div className="item-row">
                      <label>
                        Description
                        <input type="text" value={item.description} onChange={(event) => updateItemField(index, 'description', event.target.value)} required />
                      </label>
                      <label>
                        Metal
                        <select value={item.metal} onChange={(event) => updateItemField(index, 'metal', event.target.value)}>
                          <option value="gold">Gold</option>
                          <option value="silver">Silver</option>
                        </select>
                      </label>
                    </div>
                    <div className="item-row">
                      <label>
                        Weight (grams)
                        <input type="number" min="0" value={item.weight} onChange={(event) => updateItemField(index, 'weight', event.target.value)} required />
                      </label>
                      <label>
                        Rate
                        <input type="number" min="0" value={item.rate} onChange={(event) => updateItemField(index, 'rate', event.target.value)} required />
                      </label>
                      <label>
                        Making charges
                        <input type="number" min="0" value={item.makingCharges} onChange={(event) => updateItemField(index, 'makingCharges', event.target.value)} />
                      </label>
                    </div>
                    <div className="item-row">
                      <label>
                        GST (%)
                        <input type="number" min="0" value={item.gstPercent} onChange={(event) => updateItemField(index, 'gstPercent', event.target.value)} />
                      </label>
                      <p className="item-total">Total: ₹{item.total.toFixed(2)}</p>
                      <button type="button" className="ghost" onClick={() => removeItem(index)}>
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="summary">
                <div>
                  <span>Sub total</span>
                  <strong>₹{subTotal.toFixed(2)}</strong>
                </div>
                <div>
                  <span>Grand total</span>
                  <strong>₹{grandTotal.toFixed(2)}</strong>
                </div>
              </div>
              <button type="submit" disabled={loading.invoice}>
                {loading.invoice ? 'Saving invoice...' : 'Create invoice'}
              </button>
            </form>
          ) : (
            <p className="muted">Sign in before you can create invoices.</p>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Invoices</h2>
            <button className="ghost" onClick={fetchInvoices} disabled={!isAuthenticated || loading.invoices}>
              Refresh
            </button>
          </div>
          {isAuthenticated ? (
            loading.invoices ? (
              <p className="muted">Loading invoices…</p>
            ) : invoices.length ? (
              <div className="invoice-list">
                {invoices.map((invoice) => (
                  <article key={invoice._id} className="invoice-card">
                    <header>
                      <p className="invoice-number">Invoice #{invoice.invoiceNumber || invoice._id.slice(-4)}</p>
                      <p className="muted">{new Date(invoice.createdAt).toLocaleString()}</p>
                    </header>
                    <p className="invoice-firm">Firm: {invoice.firmId?.name || '—'}</p>
                    <p>Customer: {invoice.customerName}</p>
                    <p>Metal: {invoice.metalType}</p>
                    <p>Type: {invoiceTypeNames[invoice.invoiceTypeId] || 'Custom'}</p>
                    <p className="invoice-total">Total: ₹{((invoice.grandTotal ?? invoice.items?.reduce((sum, item) => sum + (item.total || 0), 0)) || 0).toFixed(2)}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="muted">No invoices yet</p>
            )
          ) : (
            <p className="muted">Sign in to see invoices.</p>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
