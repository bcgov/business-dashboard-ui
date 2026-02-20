export const getAlertHeader = function(alert: Partial<AlertI>): string {
  const t = useNuxtApp().$i18n.t
  return t(alert.alertType ? 'alerts.headers.' + alert.alertType : alert.text, alert.options)
}

export const getAlertIcon = function(alert: Partial<AlertI>): string {
  if (alert.alertType) {
    return 'i-mdi-alert'
  }

  switch (alert.severity?.toLowerCase()) {
    case 'error':
      return 'i-mdi-alert-circle'
    case 'warning':
      return 'i-mdi-alert'
    case 'info':
      return 'i-mdi-information'
    case 'success':
      return 'i-mdi-check'
    default:
      return 'i-mdi-alert-circle'
  }
}

export const getAlertColour = function(alert: Partial<AlertI>): string {
  if (alert.alertType && !alert.severity) {
    return 'text-yellow-500'
  }

  switch (alert.severity?.toLowerCase()) {
    case 'error':
      return 'text-red-500'
    case 'warning':
      return 'text-yellow-500'
    case 'info':
      return 'text-blue-500'
    case 'success':
      return 'text-green-500'
    default:
      return 'text-yellow-500'
  }
}

/**
 * Sorts the given alerts by severity, with the specified priority severity first.
 * Default priority severity is 'error', but can be set to 'warning', 'info', or 'success'.
 * */
export const sortBySeverity = function(
  alerts: Array<Partial<AlertI>>,
  prioritySeverity = AlertSeverityE.ERROR): Array<Partial<AlertI>> {
  return alerts.sort((a, b) => {
    const aIsPriority = a.severity === prioritySeverity ? 0 : 1
    const bIsPriority = b.severity === prioritySeverity ? 0 : 1
    return aIsPriority - bIsPriority
  })
}
