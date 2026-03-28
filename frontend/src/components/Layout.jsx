import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function Layout({ children, matchCount }) {
  const { pathname } = useLocation()
  return (
    <div className="min-h-screen bg-brand-bg">
      <Sidebar matchCount={matchCount} />
      <div className="md:ml-60 flex flex-col min-h-screen pb-16 md:pb-0">
        <Topbar path={pathname} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
