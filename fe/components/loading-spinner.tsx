import { Loader2 } from "lucide-react"

type LoadingSpinnerProps = {
  isLoading: boolean
  text?: string
}

export default function LoadingSpinner({ isLoading, text = "Loading..." }: LoadingSpinnerProps) {
  if (!isLoading) return null

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  )
}