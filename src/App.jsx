import { useState } from 'react'
import './App.css'
import logo from './assets/logo.png'
import BannerSlider from './components/BannerSlider'
import Board from './components/Board'

const menuItems = ['전체', '공지사항', '자유게시판', '질문과답변']

function App() {
  const [activeMenu, setActiveMenu] = useState('전체')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const selectMenu = (item) => {
    setActiveMenu(item)
    setIsMenuOpen(false)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <span className="app-logo">
            <img src={logo} alt="" className="app-logo-mark" />
            Flow
          </span>
          <nav className="app-menu">
            {menuItems.map((item) => (
              <button
                key={item}
                type="button"
                className={
                  item === activeMenu ? 'app-menu-item app-menu-item--active' : 'app-menu-item'
                }
                onClick={() => selectMenu(item)}
              >
                {item}
              </button>
            ))}
          </nav>
          <button
            type="button"
            className="app-menu-toggle"
            aria-label="메뉴 열기"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div className="app-menu-sheet">
          <div className="app-menu-sheet-header">
            <span className="app-logo">
            <img src={logo} alt="" className="app-logo-mark" />
            Flow
          </span>
            <button
              type="button"
              className="app-menu-sheet-close"
              aria-label="메뉴 닫기"
              onClick={() => setIsMenuOpen(false)}
            >
              ✕
            </button>
          </div>
          <nav className="app-menu-sheet-nav">
            {menuItems.map((item) => (
              <button
                key={item}
                type="button"
                className={
                  item === activeMenu
                    ? 'app-menu-sheet-item app-menu-sheet-item--active'
                    : 'app-menu-sheet-item'
                }
                onClick={() => selectMenu(item)}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>
      )}

      <main className="app-main">
        {activeMenu === '전체' && <BannerSlider />}
        <Board showMarquee={activeMenu === '자유게시판'} />
      </main>
    </div>
  )
}

export default App
