interface SocialLink {
  name: string
  url: string
  icon: string
}

interface SocialLinksProps {
  links?: SocialLink[]
  className?: string
}

const defaultLinks: SocialLink[] = [
  {
    name: 'Twitter',
    url: 'https://twitter.com/dealfinderapp',
    icon: '𝕏',
  },
  {
    name: 'Telegram',
    url: 'https://t.me/dealfinderapp',
    icon: '✈️',
  },
  {
    name: 'GitHub',
    url: 'https://github.com/dealfinder',
    icon: '🐙',
  },
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com/company/dealfinder',
    icon: '💼',
  },
]

export function SocialLinks({
  links = defaultLinks,
  className = ''
}: SocialLinksProps) {

  return (
    <div className={`flex space-x-4 ${className}`}>
      {links.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-gray-900 transition-colors duration-200 text-lg"
          aria-label={link.name}
        >
          {link.icon}
        </a>
      ))}
    </div>
  )
}
