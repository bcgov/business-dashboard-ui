export function getSessionExpiredError(): DialogOptionsI {
  const t = useNuxtApp().$i18n.t

  return {
    buttons: [
      {
        onClick: useBcrosNavigate().goToBcrosHomeDecide,
        onClickClose: true,
        text: t('button.dialog.cancel'),
        variant: 'outline'
      },
      {
        onClick: useBcrosNavigate().goToBcrosLogIn,
        onClickClose: true,
        text: t('button.dialog.logIn')
      }
    ],
    onClose: useBcrosNavigate().goToBcrosHomeDecide,
    text: t('text.dialog.error.sessionExpiredError.text'),
    title: t('text.dialog.error.sessionExpiredError.title')
  }
}
