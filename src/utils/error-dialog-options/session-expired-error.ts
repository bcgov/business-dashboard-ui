export function getSessionExpiredError(): DialogOptionsI {
  const t = useNuxtApp().$i18n.t

  return {
    buttons: [
      {
        onClick: useBcrosNavigate().goToBcrosHome,
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
    onClose: useBcrosNavigate().goToBcrosHome,
    text: t('text.dialog.error.sessionExpiredError.text'),
    title: t('text.dialog.error.sessionExpiredError.title')
  }
}
