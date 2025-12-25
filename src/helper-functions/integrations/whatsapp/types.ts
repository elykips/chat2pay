export type StateName =
  | 'start'
  | 'showMenu'
  | 'addToCart'
  | 'reviewCart'
  | 'confirmOrder'
  | 'paymentPending'
  | 'paymentSuccess'
  | 'paymentFailed'
  | 'completed'

export type CartItem = {
  item_id: string
  name: string
  price: number
  qty: number
}

export type SessionContext = {
  menu_cache_key?: string

  cart?: {
    items: CartItem[]
  }

  order?: {
    order_id?: string
    payment_id?: string
    amount?: number
    currency?: string
  }

  payment?: {
    method?: 'mpesa_stk'
    status?: 'initiated' | 'pending' | 'success' | 'failed'
    retries?: number
    last_error?: string
  }
}

export type SideEffect =
  | { type: 'create_order_and_payment'; payload?: any }
  | { type: 'initiate_stk'; payload?: any }
  | { type: 'notify_n8n'; payload: { event: string; data: any } }
  | { type: 'none' }

export type StateResult = {
  reply: string | object
  nextState?: StateName
  contextPatch?: Partial<SessionContext>
  sideEffect?: SideEffect
}

export type StateArgs = {
  vendorId: string
  phone: string
  message: string
  context: SessionContext
  db: any
  app: any
}

export type StateHandler = (args: StateArgs) => Promise<StateResult>
