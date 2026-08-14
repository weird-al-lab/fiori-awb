import { useNavigate } from 'react-router-dom'
import { Text } from '@ui5/webcomponents-react/Text'
import { THEME_LAB_CATEGORIES } from './categories'
import { ThemeLabLayout } from './ThemeLabLayout'

export function ThemeLabIndexPage() {
  const navigate = useNavigate()

  return (
    <ThemeLabLayout title="Theme Lab" onBack={() => navigate('/')}>
      <div className="theme-lab-intro">
        <Text>
          Temporary gallery to verify that <code>awb_custom</code> theme tokens
          cascade into UI5 components. Toggle Custom-Theme in the ShellBar and
          compare with Horizon.
        </Text>
        <div className="theme-lab-howto">
          <strong>Workflow</strong>
          <ol>
            <li>
              Edit <code>src/theme/awb_custom.less</code>
            </li>
            <li>
              Run <code>npm run build:theme</code>
            </li>
            <li>Hard-refresh and enable Custom-Theme in the ShellBar</li>
            <li>Open a category below and check default + state samples</li>
          </ol>
          <p style={{ marginTop: '0.75rem', marginBottom: 0 }}>
            <strong>Known shadow-DOM gaps:</strong> ShellBar search radius and
            profile-avatar hover use{' '}
            <code>src/theme/shellbar-search-overrides.ts</code> (
            <code>addCustomCSS</code>), not LESS alone. Prefer tokens first; add
            overrides only when a category still ignores variables.
          </p>
        </div>
      </div>

      <div className="theme-lab-category-grid">
        {THEME_LAB_CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            className="theme-lab-category-card"
            onClick={() => navigate(`/theme-lab/${category.id}`)}
          >
            <span className="theme-lab-card-title">{category.title}</span>
            <span className="theme-lab-card-desc">{category.description}</span>
          </button>
        ))}
      </div>
    </ThemeLabLayout>
  )
}
