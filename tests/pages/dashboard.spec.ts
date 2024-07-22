import { beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, mount, VueWrapper } from '@vue/test-utils'
import { mockedI18n } from '../test-utils/mockedi18n'

import Dashboard from '../../src/pages/dashboard.vue'

describe('dashboard page tests', () => {
  let wrapper: VueWrapper<any>

  beforeEach(async () => {
    wrapper = mount(Dashboard, { global: { plugins: [mockedI18n] } })
    // await api calls to resolve
    await flushPromises()
  })

  it('renders search page with expected child components for public search', () => {
    // check header is there
    expect(wrapper.text()).toContain('title.section.filingHistory')
  })
})
