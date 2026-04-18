import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react'
import logo from '../assets/favicon.png'

function Footer() {
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: 'Platform',
      links: [
        { name: 'Home', href: '/' },
        { name: 'Communities', href: '/communities' },
        { name: 'Discussions', href: '/discussions' },
        { name: 'Events', href: '/events' },
        { name: 'Resources', href: '/resources' }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Guidelines', href: '/guidelines' },
        { name: 'Contact Us', href: '/contact' },
        { name: 'FAQ', href: '/faq' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Community Guidelines', href: '/community-guidelines' }
      ]
    }
  ]

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' }
  ]

  const contactInfo = [
    { icon: Mail, text: 'info@hckonnect.edu' },
    { icon: Phone, text: '+977-1-123456' },
    { icon: MapPin, text: 'Kathmandu, Nepal' }
  ]

  return (
    <footer className="mt-auto">

      {/* Upper section — #3c3c3c */}
      <div style={{ backgroundColor: '#3c3c3c' }}>
        <div className="mx-auto w-full max-w-6xl px-6 pt-11 pb-10">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-x-16">

            {/* Brand */}
            <div className="lg:col-span-1">

              <div className="mb-5 flex items-center gap-4">
                <Link
                  to={'/'}
                  className="flex-shrink-0 flex flex-col group"
                >
                  <div className="flex items-center gap-2 group cursor-pointer">
                    <img src={logo} alt="logo" className="h-8 w-8 rounded-lg transition-transform group-hover:scale-105" />

                    <span className="text-xl text-primary font-display font-bold tracking-tight">
                      HCKonnect
                    </span>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-surface-muted mt-0.5 ml-0.5">
                    Herald Community Konnect
                  </span>
                </Link>
              </div>


              <p className="text-sm leading-relaxed mb-6 max-w-sm" style={{ color: '#a1a1aa' }}>
                Building stronger college communities through meaningful connections and collaborative opportunities.
              </p>

              <div className="space-y-2.5">
                {contactInfo.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                    >
                      <Icon size={13} className="text-primary" />
                    </div>
                    <span className="text-[12.5px]" style={{ color: '#a1a1aa' }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nav columns */}
            {footerSections.map((section) => (
              <div key={section.title}>
                <h4
                  className="text-[10px] text-primary font-bold uppercase tracking-[0.18em] mb-4"

                >
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-[13px] hover:text-primary transition-colors duration-150"
                        style={{ color: '#a1a1aa' }}
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar — primary green */}
      <div className="border-t border-primary" style={{ backgroundColor: '#3c3c3c' }}>
        <div className="mx-auto w-full max-w-6xl px-6 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-[12px] text-white/80">
            © {currentYear} <span className="font-semibold text-white">HCKonnect</span>. All rights reserved.
          </p>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-white/70 tracking-wide">Follow us</span>
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white hover:bg-white/35 border border-white/25 transition-colors duration-150"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>
      </div>

    </footer >
  )
}

export default Footer