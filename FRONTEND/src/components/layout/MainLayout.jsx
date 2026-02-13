import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../Navbar'

export default function MainLayout() {
    const [menuOpen, setMenuOpen] = useState(false)

    const toggleMenu = () => setMenuOpen(!menuOpen)
    const closeMenu = () => setMenuOpen(false)

    return (
        <div className="min-h-screen bg-[#f4f5f2] text-[#0d1f14]">
            <Navbar
                menuOpen={menuOpen}
                toggleMenu={toggleMenu}
                closeMenu={closeMenu}
                navSolid={true}
            />
            <main className="pt-24 pb-16">
                <Outlet />
            </main>
        </div>
    )
}
