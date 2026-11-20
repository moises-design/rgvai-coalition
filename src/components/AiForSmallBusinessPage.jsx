import usePageMeta from '../hooks/usePageMeta'
import WorkshopDeckPage from './WorkshopDeckPage'
import { SMALL_BUSINESS, fillBusiness } from '../data/aiForSmallBusiness'

export default function AiForSmallBusinessPage() {
  usePageMeta({
    title: 'AI for Small Business — RGV AI Coalition',
    description: 'Follow along with the AI for Small Business workshop: the slides and four hands-on prompts ready to copy, for reviews, social posts, quote follow-ups and more.',
    ogTitle: 'AI for Small Business — RGV AI Coalition',
    path: SMALL_BUSINESS.path,
  })

  return <WorkshopDeckPage workshop={SMALL_BUSINESS} fill={fillBusiness} />
}
