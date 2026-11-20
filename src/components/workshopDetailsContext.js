import { createContext } from 'react'

// The visitor's own details (business name, city, phone, hours) typed into
// the details box on a workshop page, used to fill the prompts.
export const WorkshopDetailsContext = createContext({
  values: {},
  fill: template => [{ text: template, kind: 'text' }],
  setField: () => {},
  clear: () => {},
})
