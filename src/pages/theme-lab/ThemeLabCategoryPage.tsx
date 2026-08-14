import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  getThemeLabCategory,
  isThemeLabCategoryId,
  THEME_LAB_CATEGORIES,
} from './categories'
import { ThemeLabLayout } from './ThemeLabLayout'
import { ButtonsGallery } from './galleries/ButtonsGallery'
import { ChartsGallery } from './galleries/ChartsGallery'
import { DisplayGallery } from './galleries/DisplayGallery'
import { FeedbackGallery } from './galleries/FeedbackGallery'
import { FormsGallery } from './galleries/FormsGallery'
import { LayoutGallery } from './galleries/LayoutGallery'
import { ListsTablesGallery } from './galleries/ListsTablesGallery'
import { MiscGallery } from './galleries/MiscGallery'
import { NavigationGallery } from './galleries/NavigationGallery'
import { ShellGallery } from './galleries/ShellGallery'
import { TypographyGallery } from './galleries/TypographyGallery'
import { WizardObjectGallery } from './galleries/WizardObjectGallery'

const GALLERIES = {
  shell: ShellGallery,
  buttons: ButtonsGallery,
  forms: FormsGallery,
  'lists-tables': ListsTablesGallery,
  navigation: NavigationGallery,
  layout: LayoutGallery,
  feedback: FeedbackGallery,
  display: DisplayGallery,
  typography: TypographyGallery,
  charts: ChartsGallery,
  'wizard-object': WizardObjectGallery,
  misc: MiscGallery,
} as const

export function ThemeLabCategoryPage() {
  const { category: categoryId } = useParams()
  const navigate = useNavigate()

  if (!categoryId || !isThemeLabCategoryId(categoryId)) {
    return <Navigate to="/theme-lab" replace />
  }

  const category = getThemeLabCategory(categoryId)!
  const Gallery = GALLERIES[categoryId]

  return (
    <ThemeLabLayout
      title={category.title}
      onBack={() => navigate('/theme-lab')}
      showCategoryNav
    >
      <p className="theme-lab-note" style={{ marginTop: 0 }}>
        {category.description}. Hover states are CSS-driven — hover the controls
        below. Other states are shown explicitly.
      </p>

      <nav className="theme-lab-nav-links" aria-label="Andere Kategorien">
        {THEME_LAB_CATEGORIES.map((item) =>
          item.id === categoryId ? (
            <strong key={item.id}>{item.title}</strong>
          ) : (
            <Link key={item.id} to={`/theme-lab/${item.id}`}>
              {item.title}
            </Link>
          ),
        )}
      </nav>

      <div className="theme-lab-panels">
        <Gallery />
      </div>
    </ThemeLabLayout>
  )
}
