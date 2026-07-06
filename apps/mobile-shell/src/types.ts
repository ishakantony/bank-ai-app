/**
 * Shell-local domain types. These describe the mock API payloads the shell
 * consumes (auth + the home dashboard). Kept here rather than in
 * `@bank-ai/shared` because they're specific to this app, not the chat contract.
 */

export interface AuthUser {
  name: string
  email: string
}

export interface AuthSession {
  token: string
  user: AuthUser
}

/** Icon keys resolved to a lucide component at render time (see iconMap). */
export type QuickActionIcon =
  | 'duitnow'
  | 'exchange'
  | 'jompay'
  | 'ai'
  | 'more'

export interface QuickAction {
  id: string
  label: string
  icon: QuickActionIcon
}

export type AccountIcon =
  | 'deposits'
  | 'investments'
  | 'cards'
  | 'loans'

export interface SubAccount {
  name: string
  detail: string
  balance: number
}

export interface Account {
  id: string
  name: string
  icon: AccountIcon
  balance: number
  /** Optional positive badge, e.g. "Earned RM100". */
  badge?: string
  children: SubAccount[]
}

export interface DashboardData {
  greetingName: string
  quickActions: QuickAction[]
  totalAssets: number
  accounts: Account[]
}
