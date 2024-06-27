export function getDownloadFileError(): DialogOptionsI {
  const t = useNuxtApp().$i18n.t
  return {
    buttons: [{ onClickClose: true, text: t('button.general.ok') }],
    text: t('text.dialog.error.download'),
    title: t('title.dialog.error.download')
  }
}
