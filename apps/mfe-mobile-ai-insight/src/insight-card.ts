import './index.css'
import { insightCardSchema } from './schema'
import InsightCard from './InsightCard'

// The exposed contract, identical to the AI block remotes (spend/portfolio/…):
// the carousel validates the feed's opaque `data` against this schema (fetched
// with the component at runtime) before rendering, so Team A never needs a
// compile-time dependency on the card's data shape.
export default { schema: insightCardSchema, Component: InsightCard }
