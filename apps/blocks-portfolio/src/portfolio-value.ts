import './index.css'
import { portfolioValueSchema } from '@bank-ai/shared'
import PortfolioValue from './PortfolioValue'

// The exposed contract: the host validates incoming block JSON against this
// schema (fetched with the component at runtime) before rendering, so the host
// never needs a compile-time dependency on the block's data shape.
export default { schema: portfolioValueSchema, Component: PortfolioValue }
