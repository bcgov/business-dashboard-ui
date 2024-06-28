import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { mockedI18n } from '../../test-utils/mockedi18n'

import { BcrosAlerts } from '#components'

describe('AlertDisplay tests', () => {
  const frozenAlert: Partial<AlertI> = {
    alertType: AlertTypesE.FROZEN
  }

  const d = new Date()
  const amalAlert: Partial<AlertI> = {
    alertType: AlertTypesE.AMALGAMATION,
    date: d
  }

  // const amalText = 'This corporation is part of an amalgamation and is scheduled to ' +
  //   'become historical on ' + d.toString()
  // const frozenText = 'This business is frozen'
  const amalText = 'alerts.headers.amalgamationView Details'
  const frozenText = 'alerts.headers.frozenView Details'

  it('Displays expecteded content with a frozen alert', () => {
    const wrapper = mount(BcrosAlerts, { global: { plugins: [mockedI18n] }, props: { alerts: [frozenAlert] } })
    // verify content
    expect(wrapper.find('[data-cy=alerts-display]').exists()).toBe(true)
    const alertLines = wrapper.findAll('[data-cy=alert-line]')
    expect(alertLines.length).toBe(1)
    expect(alertLines.at(0).text()).toContain(frozenText)

    wrapper.unmount()
  })

  it('Displays expected content with a amalgamation alert', () => {
    const wrapper = mount(BcrosAlerts, { global: { plugins: [mockedI18n] }, props: { alerts: [amalAlert] } })

    // verify content
    expect(wrapper.find('[data-cy=alerts-display]').exists()).toBe(true)
    const alertLines = wrapper.findAll('[data-cy=alert-line]')
    expect(alertLines.length).toBe(1)
    expect(alertLines.at(0).text()).toContain(amalText)

    wrapper.unmount()
  })

  it('Displays expected content with multiple alerts', () => {
    const wrapper = mount(BcrosAlerts, {
      global: { plugins: [mockedI18n] },
      props: { alerts: [amalAlert, frozenAlert] }
    })
    // verify content
    expect(wrapper.find('[data-cy=alerts-display]').exists()).toBe(true)
    const alertLines = wrapper.findAll('[data-cy=alert-line]')
    expect(alertLines.length).toBe(2)
    expect(alertLines.at(0).text()).toContain(amalText)
    expect(alertLines.at(1).text()).toContain(frozenText)

    wrapper.unmount()
  })
})
