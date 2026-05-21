import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { useLang } from '../context/LangContext'
import toast from 'react-hot-toast'
import BottomNav from '../components/layout/BottomNav'
import LangSwitcher from '../components/ui/LangSwitcher'

const TEXTS = {
  kk: {
    account: '👤 Аккаунт',
    editProfile: 'Профильді өзгерту',
    editProfileSub: 'Аты, email',
    changePass: 'Парольді өзгерту',
    changePassSub: 'Ескі парольді тексереді',
    forgotPass: 'Парольді ұмыттым',
    forgotPassSub: 'Email арқылы қалпына келтіру',
    skinCare: '🧴 Тері күтімі',
    updateProfile: 'Профильді жаңарту',
    updateProfileSub: 'Өмір салты мен тері деректері',
    history: 'Анализ тарихы',
    historySub: 'Барлық нәтижелер',
    other: '⚠️ Басқа',
    logout: 'Шығу',
    logoutSub: 'Аккаунттан шығу',
    deleteAccount: 'Аккаунтты жою',
    deleteAccountSub: 'Барлық деректер жойылады',
    profileComplete: '✅ Профиль толтырылған',
    profileIncomplete: '⚠️ Профиль толтырылмаған',
    editModal: 'Профильді өзгерту',
    nameLabel: 'Аты-жөні',
    namePh: 'Атыңыз',
    saveBtn: 'Сақтау ✅',
    nameRequired: 'Атыңызды енгізіңіз',
    profileSaved: 'Профиль жаңартылды! ✅',
    changePassModal: 'Парольді өзгерту',
    oldPass: 'Ескі пароль',
    oldPassPh: 'Ескі парольіңіз',
    newPass: 'Жаңа пароль',
    newPassPh: 'Кемінде 8 таңба',
    confirmPass: 'Жаңа парольді растау',
    confirmPassPh: 'Қайта енгізіңіз',
    passNoMatch: 'Парольдер сәйкес емес',
    changePassBtn: 'Өзгерту 🔐',
    fillAll: 'Барлық өрістерді толтырыңыз',
    passMin: 'Жаңа пароль кемінде 8 таңба',
    passSaved: 'Пароль өзгертілді! 🔐',
    forgotModal: 'Парольді қалпына келтіру',
    forgotDesc: 'Email-іңізді енгізіңіз. Reset код жіберіледі.',
    sendCode: 'Код жіберу 📧',
    codeSent: '✅ Код жіберілді!',
    demoNote: 'Demo режімі: token автоматты толтырылды',
    tokenLabel: 'Reset Token',
    tokenPh: 'Token енгізіңіз',
    resetBtn: 'Парольді өзгерту ✅',
    backBtn: '← Артқа',
    resetSaved: 'Пароль қалпына келтірілді! Кіріңіз.',
    deleteModal: 'Аккаунтты жою',
    deleteWarning: '⚠️ Назар аударыңыз!',
    deleteText: 'Аккаунтты жойсаңыз барлық деректеріңіз: анализдер, профиль — мүлдем жойылады. Бұл әрекетті қайтару мүмкін емес!',
    deleteBtn: 'Иә, жою 🗑️',
    cancelBtn: 'Бас тарту',
    emailRequired: 'Email енгізіңіз',
    tokenRequired: 'Барлық өрістерді толтырыңыз',
    accountDeleted: 'Аккаунт жойылды.',
    loggedOut: 'Шықтыңыз!',
    resetReceived: 'Reset token алынды!',
  },
  ru: {
    account: '👤 Аккаунт',
    editProfile: 'Редактировать профиль',
    editProfileSub: 'Имя, email',
    changePass: 'Сменить пароль',
    changePassSub: 'Проверяет старый пароль',
    forgotPass: 'Забыл пароль',
    forgotPassSub: 'Восстановление через email',
    skinCare: '🧴 Уход за кожей',
    updateProfile: 'Обновить профиль',
    updateProfileSub: 'Образ жизни и данные о коже',
    history: 'История анализов',
    historySub: 'Все результаты',
    other: '⚠️ Прочее',
    logout: 'Выйти',
    logoutSub: 'Выйти из аккаунта',
    deleteAccount: 'Удалить аккаунт',
    deleteAccountSub: 'Все данные будут удалены',
    profileComplete: '✅ Профиль заполнен',
    profileIncomplete: '⚠️ Профиль не заполнен',
    editModal: 'Редактировать профиль',
    nameLabel: 'Полное имя',
    namePh: 'Ваше имя',
    saveBtn: 'Сохранить ✅',
    nameRequired: 'Введите имя',
    profileSaved: 'Профиль обновлён! ✅',
    changePassModal: 'Смена пароля',
    oldPass: 'Старый пароль',
    oldPassPh: 'Ваш старый пароль',
    newPass: 'Новый пароль',
    newPassPh: 'Минимум 8 символов',
    confirmPass: 'Подтвердите пароль',
    confirmPassPh: 'Повторите пароль',
    passNoMatch: 'Пароли не совпадают',
    changePassBtn: 'Изменить 🔐',
    fillAll: 'Заполните все поля',
    passMin: 'Новый пароль — минимум 8 символов',
    passSaved: 'Пароль изменён! 🔐',
    forgotModal: 'Восстановление пароля',
    forgotDesc: 'Введите ваш email. Отправим код.',
    sendCode: 'Отправить код 📧',
    codeSent: '✅ Код отправлен!',
    demoNote: 'Demo режим: токен заполнен автоматически',
    tokenLabel: 'Reset Token',
    tokenPh: 'Введите токен',
    resetBtn: 'Изменить пароль ✅',
    backBtn: '← Назад',
    resetSaved: 'Пароль восстановлен! Войдите.',
    deleteModal: 'Удаление аккаунта',
    deleteWarning: '⚠️ Внимание!',
    deleteText: 'При удалении аккаунта все данные: анализы, профиль — удалятся навсегда. Это действие нельзя отменить!',
    deleteBtn: 'Да, удалить 🗑️',
    cancelBtn: 'Отмена',
    emailRequired: 'Введите email',
    tokenRequired: 'Заполните все поля',
    accountDeleted: 'Аккаунт удалён.',
    loggedOut: 'Вы вышли!',
    resetReceived: 'Reset token получен!',
  },
  en: {
    account: '👤 Account',
    editProfile: 'Edit Profile',
    editProfileSub: 'Name, email',
    changePass: 'Change Password',
    changePassSub: 'Verifies old password',
    forgotPass: 'Forgot Password',
    forgotPassSub: 'Reset via email',
    skinCare: '🧴 Skin Care',
    updateProfile: 'Update Profile',
    updateProfileSub: 'Lifestyle and skin data',
    history: 'Analysis History',
    historySub: 'All results',
    other: '⚠️ Other',
    logout: 'Sign Out',
    logoutSub: 'Sign out of account',
    deleteAccount: 'Delete Account',
    deleteAccountSub: 'All data will be deleted',
    profileComplete: '✅ Profile complete',
    profileIncomplete: '⚠️ Profile incomplete',
    editModal: 'Edit Profile',
    nameLabel: 'Full Name',
    namePh: 'Your name',
    saveBtn: 'Save ✅',
    nameRequired: 'Enter your name',
    profileSaved: 'Profile updated! ✅',
    changePassModal: 'Change Password',
    oldPass: 'Old Password',
    oldPassPh: 'Your old password',
    newPass: 'New Password',
    newPassPh: 'At least 8 characters',
    confirmPass: 'Confirm Password',
    confirmPassPh: 'Repeat password',
    passNoMatch: 'Passwords do not match',
    changePassBtn: 'Change 🔐',
    fillAll: 'Fill all fields',
    passMin: 'New password must be at least 8 characters',
    passSaved: 'Password changed! 🔐',
    forgotModal: 'Reset Password',
    forgotDesc: 'Enter your email. We will send a code.',
    sendCode: 'Send Code 📧',
    codeSent: '✅ Code sent!',
    demoNote: 'Demo mode: token auto-filled',
    tokenLabel: 'Reset Token',
    tokenPh: 'Enter token',
    resetBtn: 'Reset Password ✅',
    backBtn: '← Back',
    resetSaved: 'Password reset! Please sign in.',
    deleteModal: 'Delete Account',
    deleteWarning: '⚠️ Warning!',
    deleteText: 'Deleting your account will permanently remove all data: analyses, profile. This cannot be undone!',
    deleteBtn: 'Yes, delete 🗑️',
    cancelBtn: 'Cancel',
    emailRequired: 'Enter your email',
    tokenRequired: 'Fill all fields',
    accountDeleted: 'Account deleted.',
    loggedOut: 'Signed out!',
    resetReceived: 'Reset token received!',
  },
}

function Modal({ title, emoji, children, onClose }) {
  return (
    <div style={m.overlay} onClick={onClose}>
      <div style={m.modal} onClick={e => e.stopPropagation()}>
        <div style={m.modalHeader}>
          <span style={{ fontSize: 24 }}>{emoji}</span>
          <h3 style={m.modalTitle}>{title}</h3>
          <button onClick={onClose} style={m.closeBtn}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

const m = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' },
  modal: { background: 'white', borderRadius: '28px 28px 0 0', padding: '24px 20px 40px', width: '100%', maxWidth: 430, animation: 'slideUp 0.3s ease' },
  modalHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #f0fafb' },
  modalTitle: { fontSize: 18, fontWeight: 800, color: '#2d3748', flex: 1, margin: 0 },
  closeBtn: { background: '#f0fafb', border: 'none', borderRadius: 10, width: 32, height: 32, cursor: 'pointer', fontSize: 14, color: '#718096', display: 'flex', alignItems: 'center', justifyContent: 'center' },
}

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth()
  const { lang } = useLang()
  const T = TEXTS[lang] || TEXTS.kk
  const navigate = useNavigate()
  const [activeModal, setActiveModal] = useState(null)
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [forgotEmail, setForgotEmail] = useState(user?.email || '')
  const [resetToken, setResetToken] = useState('')
  const [resetPass, setResetPass] = useState('')
  const [resetStep, setResetStep] = useState(1)

  const closeModal = () => {
    setActiveModal(null)
    setOldPass(''); setNewPass(''); setConfirmPass('')
    setResetToken(''); setResetPass(''); setResetStep(1)
  }

  const handleUpdateProfile = async () => {
    if (!name.trim()) { toast.error(T.nameRequired); return }
    setLoading(true)
    try {
      const updated = await authAPI.updateProfile({ name: name.trim(), email: email.trim() })
      updateUser(updated)
      toast.success(T.profileSaved)
      closeModal()
    } catch (err) {
      toast.error(err.message)
    } finally { setLoading(false) }
  }

  const handleChangePassword = async () => {
    if (!oldPass || !newPass) { toast.error(T.fillAll); return }
    if (newPass.length < 8) { toast.error(T.passMin); return }
    if (newPass !== confirmPass) { toast.error(T.passNoMatch); return }
    setLoading(true)
    try {
      await authAPI.changePassword(oldPass, newPass)
      toast.success(T.passSaved)
      closeModal()
    } catch (err) {
      toast.error(err.message)
    } finally { setLoading(false) }
  }

  const handleForgotPassword = async () => {
    if (!forgotEmail) { toast.error(T.emailRequired); return }
    setLoading(true)
    try {
      const res = await authAPI.forgotPassword(forgotEmail)
      toast.success(T.resetReceived)
      if (res.demo_token) setResetToken(res.demo_token)
      setResetStep(2)
    } catch (err) {
      toast.error(err.message)
    } finally { setLoading(false) }
  }

  const handleResetPassword = async () => {
    if (!resetToken || !resetPass) { toast.error(T.tokenRequired); return }
    if (resetPass.length < 8) { toast.error(T.passMin); return }
    setLoading(true)
    try {
      await authAPI.resetPassword(resetToken, resetPass)
      toast.success(T.resetSaved)
      logout()
      navigate('/login')
    } catch (err) {
      toast.error(err.message)
    } finally { setLoading(false) }
  }

  const handleDeleteAccount = async () => {
    setLoading(true)
    try {
      await authAPI.deleteAccount()
      toast.success(T.accountDeleted)
      logout()
      navigate('/')
    } catch (err) {
      toast.error(err.message)
    } finally { setLoading(false) }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    toast.success(T.loggedOut)
  }

  return (
    <div style={s.root}>
      <style>{`
        *{box-sizing:border-box;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        .menu-item:hover{background:#f0fafb!important}
        .inp:focus{border-color:#4ECDC4!important;outline:none;box-shadow:0 0 0 3px rgba(78,205,196,0.15);}
        .inp::placeholder{color:#b0bec5;}
      `}</style>

      {/* Header */}
      <div style={s.header}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <LangSwitcher />
        </div>
        <div style={s.avatar}>{user?.name?.[0]?.toUpperCase() || 'A'}</div>
        <h1 style={s.userName}>{user?.name}</h1>
        <p style={s.userEmail}>{user?.email}</p>
        <div style={s.badge}>
          {user?.onboarding_complete ? T.profileComplete : T.profileIncomplete}
        </div>
      </div>

      <div style={s.content}>
        {/* Аккаунт */}
        <div style={s.section}>
          <p style={s.sectionTitle}>{T.account}</p>
          <div style={s.menuCard}>
            {[
              { emoji: '✏️', label: T.editProfile, sub: T.editProfileSub, onClick: () => setActiveModal('editProfile') },
              { emoji: '🔐', label: T.changePass, sub: T.changePassSub, onClick: () => setActiveModal('changePassword') },
              { emoji: '📧', label: T.forgotPass, sub: T.forgotPassSub, onClick: () => setActiveModal('forgotPassword') },
            ].map((item, i, arr) => (
              <button key={i} className="menu-item" onClick={item.onClick}
                style={{ ...s.menuItem, ...(i < arr.length - 1 ? s.menuItemBorder : {}) }}>
                <span style={s.menuEmoji}>{item.emoji}</span>
                <div style={s.menuText}>
                  <p style={s.menuLabel}>{item.label}</p>
                  <p style={s.menuSub}>{item.sub}</p>
                </div>
                <span style={s.menuArrow}>›</span>
              </button>
            ))}
          </div>
        </div>

        {/* Тері күтімі */}
        <div style={s.section}>
          <p style={s.sectionTitle}>{T.skinCare}</p>
          <div style={s.menuCard}>
            <Link to="/onboarding" className="menu-item"
              style={{ ...s.menuItem, textDecoration: 'none', ...s.menuItemBorder }}>
              <span style={s.menuEmoji}>📋</span>
              <div style={s.menuText}>
                <p style={s.menuLabel}>{T.updateProfile}</p>
                <p style={s.menuSub}>{T.updateProfileSub}</p>
              </div>
              <span style={s.menuArrow}>›</span>
            </Link>
            <Link to="/history" className="menu-item"
              style={{ ...s.menuItem, textDecoration: 'none' }}>
              <span style={s.menuEmoji}>📊</span>
              <div style={s.menuText}>
                <p style={s.menuLabel}>{T.history}</p>
                <p style={s.menuSub}>{T.historySub}</p>
              </div>
              <span style={s.menuArrow}>›</span>
            </Link>
          </div>
        </div>

        {/* Басқа */}
        <div style={s.section}>
          <p style={s.sectionTitle}>{T.other}</p>
          <div style={s.menuCard}>
            <button className="menu-item" onClick={handleLogout}
              style={{ ...s.menuItem, ...s.menuItemBorder }}>
              <span style={s.menuEmoji}>🚪</span>
              <div style={s.menuText}>
                <p style={s.menuLabel}>{T.logout}</p>
                <p style={s.menuSub}>{T.logoutSub}</p>
              </div>
              <span style={s.menuArrow}>›</span>
            </button>
            <button className="menu-item" onClick={() => setActiveModal('deleteAccount')}
              style={s.menuItem}>
              <span style={s.menuEmoji}>🗑️</span>
              <div style={s.menuText}>
                <p style={{ ...s.menuLabel, color: '#e53e3e' }}>{T.deleteAccount}</p>
                <p style={s.menuSub}>{T.deleteAccountSub}</p>
              </div>
              <span style={{ ...s.menuArrow, color: '#e53e3e' }}>›</span>
            </button>
          </div>
        </div>
        <div style={{ height: 80 }} />
      </div>

      {/* Профильді өзгерту */}
      {activeModal === 'editProfile' && (
        <Modal title={T.editModal} emoji="✏️" onClose={closeModal}>
          <div style={s.modalBody}>
            <label style={s.mLabel}>{T.nameLabel}</label>
            <input className="inp" style={s.mInp} value={name}
              onChange={e => setName(e.target.value)} placeholder={T.namePh} />
            <label style={s.mLabel}>Email</label>
            <input className="inp" style={s.mInp} type="email" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="email@example.com" />
            <button onClick={handleUpdateProfile} disabled={loading} style={s.mBtn}>
              {loading ? <span style={s.spinner} /> : T.saveBtn}
            </button>
          </div>
        </Modal>
      )}

      {/* Парольді өзгерту */}
      {activeModal === 'changePassword' && (
        <Modal title={T.changePassModal} emoji="🔐" onClose={closeModal}>
          <div style={s.modalBody}>
            <label style={s.mLabel}>{T.oldPass}</label>
            <input className="inp" style={s.mInp} type="password" value={oldPass}
              onChange={e => setOldPass(e.target.value)} placeholder={T.oldPassPh} />
            <label style={s.mLabel}>{T.newPass}</label>
            <input className="inp" style={s.mInp} type="password" value={newPass}
              onChange={e => setNewPass(e.target.value)} placeholder={T.newPassPh} />
            <label style={s.mLabel}>{T.confirmPass}</label>
            <input className="inp" style={s.mInp} type="password" value={confirmPass}
              onChange={e => setConfirmPass(e.target.value)} placeholder={T.confirmPassPh} />
            {newPass && confirmPass && newPass !== confirmPass && (
              <p style={{ fontSize: 12, color: '#e53e3e', margin: '4px 0' }}>{T.passNoMatch}</p>
            )}
            <button onClick={handleChangePassword} disabled={loading} style={s.mBtn}>
              {loading ? <span style={s.spinner} /> : T.changePassBtn}
            </button>
          </div>
        </Modal>
      )}

      {/* Парольді ұмыттым */}
      {activeModal === 'forgotPassword' && (
        <Modal title={T.forgotModal} emoji="📧" onClose={closeModal}>
          <div style={s.modalBody}>
            {resetStep === 1 ? (
              <>
                <p style={{ fontSize: 13, color: '#718096', marginBottom: 16, lineHeight: 1.6 }}>{T.forgotDesc}</p>
                <label style={s.mLabel}>Email</label>
                <input className="inp" style={s.mInp} type="email" value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)} placeholder="email@example.com" />
                <button onClick={handleForgotPassword} disabled={loading} style={s.mBtn}>
                  {loading ? <span style={s.spinner} /> : T.sendCode}
                </button>
              </>
            ) : (
              <>
                <div style={{ background: '#f0fafb', borderRadius: 12, padding: '12px', marginBottom: 16, border: '1px solid #c8ede8' }}>
                  <p style={{ fontSize: 12, color: '#4ECDC4', fontWeight: 700, margin: '0 0 4px' }}>{T.codeSent}</p>
                  <p style={{ fontSize: 11, color: '#718096', margin: 0 }}>{T.demoNote}</p>
                </div>
                <label style={s.mLabel}>{T.tokenLabel}</label>
                <input className="inp" style={s.mInp} value={resetToken}
                  onChange={e => setResetToken(e.target.value)} placeholder={T.tokenPh} />
                <label style={s.mLabel}>{T.newPass}</label>
                <input className="inp" style={s.mInp} type="password" value={resetPass}
                  onChange={e => setResetPass(e.target.value)} placeholder={T.newPassPh} />
                <button onClick={handleResetPassword} disabled={loading} style={s.mBtn}>
                  {loading ? <span style={s.spinner} /> : T.resetBtn}
                </button>
                <button onClick={() => setResetStep(1)} style={s.mSecBtn}>{T.backBtn}</button>
              </>
            )}
          </div>
        </Modal>
      )}

      {/* Аккаунтты жою */}
      {activeModal === 'deleteAccount' && (
        <Modal title={T.deleteModal} emoji="🗑️" onClose={closeModal}>
          <div style={s.modalBody}>
            <div style={{ background: '#fff5f5', borderRadius: 14, padding: '16px', marginBottom: 20, border: '1px solid #fed7d7' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#e53e3e', margin: '0 0 6px' }}>{T.deleteWarning}</p>
              <p style={{ fontSize: 13, color: '#c53030', margin: 0, lineHeight: 1.6 }}>{T.deleteText}</p>
            </div>
            <button onClick={handleDeleteAccount} disabled={loading}
              style={{ ...s.mBtn, background: '#e53e3e', boxShadow: '0 4px 15px rgba(229,62,62,0.3)' }}>
              {loading ? <span style={s.spinner} /> : T.deleteBtn}
            </button>
            <button onClick={closeModal} style={s.mSecBtn}>{T.cancelBtn}</button>
          </div>
        </Modal>
      )}

      <BottomNav />
    </div>
  )
}

const s = {
  root: { minHeight: '100vh', background: '#f0fafb', fontFamily: "'Nunito','SF Pro Display',-apple-system,sans-serif", maxWidth: 430, margin: '0 auto' },
  header: { background: 'linear-gradient(135deg,#4ECDC4,#44b8b0)', padding: '48px 20px 32px', textAlign: 'center' },
  avatar: { width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 900, color: 'white', margin: '0 auto 12px', border: '3px solid rgba(255,255,255,0.4)' },
  userName: { fontSize: 22, fontWeight: 900, color: 'white', margin: '0 0 4px' },
  userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: '0 0 12px' },
  badge: { display: 'inline-block', background: 'rgba(255,255,255,0.2)', color: 'white', padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600, border: '1px solid rgba(255,255,255,0.3)' },
  content: { padding: '16px' },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: 700, color: '#a0aec0', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px 4px' },
  menuCard: { background: 'white', borderRadius: 20, overflow: 'hidden', border: '1px solid #e8f4f3', boxShadow: '0 2px 12px rgba(78,205,196,0.06)' },
  menuItem: { width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '16px', background: 'white', border: 'none', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left' },
  menuItemBorder: { borderBottom: '1px solid #f0fafb' },
  menuEmoji: { fontSize: 22, width: 36, height: 36, borderRadius: 12, background: '#f0fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: 700, color: '#2d3748', margin: '0 0 2px' },
  menuSub: { fontSize: 12, color: '#a0aec0', margin: 0 },
  menuArrow: { fontSize: 20, color: '#cbd5e0', fontWeight: 300 },
  modalBody: { display: 'flex', flexDirection: 'column', gap: 12 },
  mLabel: { fontSize: 13, fontWeight: 700, color: '#4a5568', marginBottom: 4 },
  mInp: { width: '100%', padding: '13px 16px', border: '1.5px solid #e8f4f3', borderRadius: 14, fontSize: 14, color: '#2d3748', background: '#f8fdfc', transition: 'all 0.2s' },
  mBtn: { width: '100%', padding: '15px', background: '#4ECDC4', color: 'white', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: 'pointer', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 4px 15px rgba(78,205,196,0.3)' },
  mSecBtn: { width: '100%', padding: '13px', background: '#f0fafb', color: '#718096', border: '1.5px solid #e8f4f3', borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 4 },
  spinner: { width: 20, height: 20, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' },
}
