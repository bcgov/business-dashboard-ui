export function getDownloadFileError(): DialogOptionsI {
  const t = useNuxtApp().$i18n.t
  return {
    buttons: [{ onClickClose: true, text: t('button.general.close') }],
    text: '',
    title: t('text.dialog.error.downloadError.title'),
    hideClose: true
  }
}
