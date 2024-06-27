export function getDefaultError(): DialogOptionsI {
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
    text: t('text.dialog.error.default'),
    title: t('title.dialog.error.default')
  }
}
