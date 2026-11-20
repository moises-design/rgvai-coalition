import usePageMeta from '../hooks/usePageMeta'
import WorkshopDeckPage from './WorkshopDeckPage'
import { NONPROFITS, fillNonprofit } from '../data/aiForNonprofits'

export default function AiForNonprofitsPage() {
  usePageMeta({
    title: 'AI for Nonprofits — RGV AI Coalition',
    description: 'Follow along with the AI for Nonprofits workshop: the slides and four hands-on prompts ready to copy, for grant writing, volunteer schedules, donor thank-yous and more.',
    ogTitle: 'AI for Nonprofits — RGV AI Coalition',
    path: NONPROFITS.path,
  })

  return <WorkshopDeckPage workshop={NONPROFITS} fill={fillNonprofit} />
}
