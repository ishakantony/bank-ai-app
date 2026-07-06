import './index.css'
import PromoCarousel from './PromoCarousel'

// The exposed contract: a self-fetching widget. There is NO `schema` — the host
// supplies no data; the widget fetches and validates `/api/promos` itself. The
// host mounts `<Component />` with no props.
export default { Component: PromoCarousel }
