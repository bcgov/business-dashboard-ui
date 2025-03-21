export function getNotFoundError(): DialogOptionsI {
  const t = useNuxtApp().$i18n.t
  return {
    buttons: [
      {
        onClick: useBcrosNavigate().goToBcrosDashboard,
        onClickClose: true,
        text: t('button.dialog.goToBRD')
      }
    ],
    hideClose: true,
    text: t('text.dialog.error.default'),
    title: t('title.dialog.error.default')
  }
}
