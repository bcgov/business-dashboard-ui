export function getPageNotFoundError(): DialogOptionsI {
  const t = useNuxtApp().$i18n.t
  const refreshPage = () => {
    window.location.reload()
  }
  return {
    buttons: [
      {
        onClick: useBcrosNavigate().goToBcrosDashboard,
        onClickClose: true,
        text: t('button.dialog.goBack'),
        variant: 'outline'
      },
      {
        onClick: refreshPage,
        onClickClose: true,
        text: t('button.dialog.refresh')
      }
    ],
    hideClose: true,
    text: t('text.dialog.error.default'),
    title: t('title.dialog.error.default')
  }
}
