export function getDefaultError (): DialogOptionsI {
  return {
    buttons: [
      {
        onClick: useBcrosNavigate().goToBcrosDashboard,
        onClickClose: true,
        text: 'OK'
      }
    ],
    onClose: useBcrosNavigate().goToBcrosDashboard,
    text: 'The Business Dashboard application is currently unavailable. Please try again later.',
    title: 'Business Dashboard Unavailable'
  }
}
