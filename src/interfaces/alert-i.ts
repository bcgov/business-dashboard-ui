import type { AlertTypesE } from "~/enums/alert-types-e"
import type { AlertSeverityE } from "~/enums/alert-severity-e"

export interface AlertI {
  severity: AlertSeverityE | null
  alertType: AlertTypesE | null
  text: string | null
  description: string | null
  date: any | null
}
