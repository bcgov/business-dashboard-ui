import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { mockedI18n } from '../../test-utils/mockedi18n'
import { useBcrosFilings } from '../../../src/stores/filings'
import { BcrosFilingList } from '#components'

describe('BcrosFilingList loading state', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mountList = () =>
    mount(BcrosFilingList, { props: { filings: [] }, global: { plugins: [mockedI18n] } })

  it('shows the loading skeletons and hides the empty state while filings are loading', () => {
    useBcrosFilings().loading = true
    const wrapper = mountList()

    const loadingBlock = wrapper.find('[data-cy="filing-history-loading"]')
    expect(loadingBlock.exists()).toBe(true)
    // three skeleton placeholder cards
    expect(loadingBlock.element.children.length).toBe(3)
    expect(wrapper.text()).not.toContain('text.filing.completeYourFiling')

    wrapper.unmount()
  })

  it('shows the empty state and no skeletons once loading completes', () => {
    useBcrosFilings().loading = false
    const wrapper = mountList()

    expect(wrapper.find('[data-cy="filing-history-loading"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('text.filing.completeYourFiling')

    wrapper.unmount()
  })
})
