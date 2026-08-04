import { beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { mockedI18n } from '../test-utils/mockedi18n'
import Dashboard from '../../src/pages/dashboard.vue'
import { DefaultRoles } from '../test-utils'
import { useBcrosAccount } from '../../src/stores/account'
import { useBcrosFilings } from '../../src/stores/filings'

describe('dashboard page tests', () => {
  let wrapper: VueWrapper<any>

  beforeEach(async () => {
    setActivePinia(createPinia())
    const store = useBcrosAccount() // <-- move here!
    store.setAuthorizedActions(DefaultRoles)
    wrapper = mount(Dashboard, { global: { plugins: [mockedI18n] } })
    // await api calls to resolve
    await flushPromises()
  })

  it('renders search page with expected child components for public search', () => {
    // check header is there
    expect(wrapper.text()).toContain('title.section.filingHistory')
  })

  it('shows a loading label instead of the filing count while filings are loading', async () => {
    const filings = useBcrosFilings()

    filings.loading = true
    await wrapper.vm.$nextTick()
    const loadingLabel = wrapper.find('[data-cy="filing-history-count-loading"]')
    expect(loadingLabel.exists()).toBe(true)
    expect(loadingLabel.text()).toBe('(loading...)')
    expect(wrapper.find('[data-cy="filing-history-count"]').exists()).toBe(false)

    filings.loading = false
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-cy="filing-history-count-loading"]').exists()).toBe(false)
    expect(wrapper.find('[data-cy="filing-history-count"]').exists()).toBe(true)
  })
})
