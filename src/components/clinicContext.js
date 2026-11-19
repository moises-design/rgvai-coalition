import { createContext } from 'react'

// The visitor's own clinic details (name, city, phone, hours), typed into the
// "Your clinic" box on /ai-for-healthcare, plus the sample appointment date.
// Used to fill the placeholders in the workshop prompts and scripts.
export const ClinicContext = createContext({
  clinic: { clinic: '', city: '', phone: '', hours: '' },
  sampleDate: '',
  setField: () => {},
  clear: () => {},
})
