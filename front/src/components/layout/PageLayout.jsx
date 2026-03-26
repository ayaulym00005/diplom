import Navbar from './Navbar'

export default function PageLayout({ children, className = '', noPadding = false }) {
  return (
    <div className="grain-overlay min-h-screen mesh-bg">
      <Navbar />
      <main className={`pt-16 ${noPadding ? '' : 'px-5 py-10'} ${className}`}>
        {children}
      </main>
    </div>
  )
}
