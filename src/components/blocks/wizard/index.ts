import { defineBlock } from '../defineBlock'
import { wizardSchema } from './schema'

export default defineBlock(wizardSchema, () => import('./WizardCard'))
