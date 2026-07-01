import { defineBlock } from '../defineBlock'
import { driftBarsSchema } from '@bank-ai/shared'

export default defineBlock(driftBarsSchema, () => import('./DriftBars'))
