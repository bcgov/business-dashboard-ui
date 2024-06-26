export function getAuthAccessError(): DialogOptionsI {
  const t = useNuxtApp().$i18n.t
  return {
    buttons: [
      {
        onClick: useBcrosNavigate().goToBcrosDashboard,
        onClickClose: true,
        text: t('button.general.ok')
      }
    ],
    onClose: useBcrosNavigate().goToBcrosDashboard,
    text: '',
    title: t('title.dialog.error.access')
  }
}
