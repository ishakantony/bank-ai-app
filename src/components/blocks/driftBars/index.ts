import { defineBlock } from '../defineBlock'
import { driftBarsSchema } from './schema'

export default defineBlock(driftBarsSchema, () => import('./DriftBars'))
