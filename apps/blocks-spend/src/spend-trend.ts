import './index.css'
import { spendTrendSchema } from '@bank-ai/shared'
import SpendTrend from './SpendTrend'

// The exposed contract: the host validates incoming block JSON against this
// schema (fetched with the component at runtime) before rendering, so the host
// never needs a compile-time dependency on the block's data shape.
export default { schema: spendTrendSchema, Component: SpendTrend }
