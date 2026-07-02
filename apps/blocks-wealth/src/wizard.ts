import './index.css'
import { wizardSchema } from '@bank-ai/shared'
import WizardCard from './WizardCard'

// The exposed contract: the host validates incoming block JSON against this
// schema (fetched with the component at runtime) before rendering, so the host
// never needs a compile-time dependency on the block's data shape.
export default { schema: wizardSchema, Component: WizardCard }
