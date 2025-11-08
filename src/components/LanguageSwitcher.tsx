import { useNavigate, useParams } from '@tanstack/react-router'
import { useLingui } from '@lingui/react'

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
]

export function LanguageSwitcher() {
  const navigate = useNavigate()
  const params = useParams({ strict: false })
  const { i18n } = useLingui()

  const currentLang = params.lang || 'en'

  const handleLanguageChange = (langCode: string) => {
    if (langCode === currentLang) return

    // Change Lingui language
    i18n.activate(langCode)

    // Navigate to the same route with new language
    const currentPath = window.location.pathname
    const pathWithoutLang = currentPath.replace(/^\/[a-z]{2}/, '')
    const newPath = `/${langCode}${pathWithoutLang || '/'}`
    const search = window.location.search

    navigate({
      to: newPath + search,
      replace: true,
    })
  }

  return (
    <div className="flex items-center space-x-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            currentLang === lang.code
              ? 'bg-gray-100 text-gray-800'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
          title={lang.name}
        >
          <span>{lang.flag}</span>
          <span className="hidden sm:inline">{lang.name}</span>
        </button>
      ))}
    </div>
  )
}
