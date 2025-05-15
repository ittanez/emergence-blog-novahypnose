import * as React from "react"

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 1000000

type ToastActionElement = React.ReactElement<unknown>

export type ToastProps = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  open: boolean
  onOpenChange: (open: boolean) => void
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: Omit<ToastProps, "id">
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToastProps>
      id: string
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: string
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: string
    }

interface State {
  toasts: ToastProps[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [
          ...state.toasts,
          { ...action.toast, id: genId(), open: true },
        ].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        setRemoveToastTimer(toastId)
      } else {
        state.toasts.forEach((toast) => {
          setRemoveToastTimer(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    default:
      return state
  }
}

function setRemoveToastTimer(toastId: string) {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

const listeners: Array<(state: State) => void> = []

function dispatch(action: Action) {
  state = reducer(state, action)
  listeners.forEach((listener) => {
    listener(state)
  })
}

let state: State = { toasts: [] }

export function toast({ title, description, action, ...props }: Omit<ToastProps, "id" | "open" | "onOpenChange">) {
  const id = genId()

  const update = (props: Partial<ToastProps>) =>
    dispatch({
      type: "UPDATE_TOAST",
      id,
      toast: { ...props },
    })

  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) {
          dismiss()
        }
      },
      title,
      description,
      action,
    },
  })

  return {
    id,
    dismiss,
    update,
  }
}

toast.dismiss = (toastId?: string) => {
  dispatch({ type: "DISMISS_TOAST", toastId })
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  React.useEffect(() => {
    function handleToastsChange(state: State) {
      setToasts(state.toasts)
    }

    listeners.push(handleToastsChange)
    return () => {
      const index = listeners.indexOf(handleToastsChange)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  return {
    toast,
    toasts,
    dismiss: toast.dismiss,
  }
}
