import { defineBlock } from '../defineBlock'
import { wizardSchema } from '@bank-ai/shared'

export default defineBlock(wizardSchema, () => import('./WizardCard'))
