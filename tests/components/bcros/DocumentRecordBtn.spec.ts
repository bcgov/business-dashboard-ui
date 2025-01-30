import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import { BcrosDocumentRecordBtn } from '#components'
import { mockedI18n } from '~~/tests/test-utils/mockedi18n'

describe('DocumentRecordBtn tests', () => {
  let wrapper
  const documentId = '12345'

  beforeEach(() => {
    wrapper = mount(BcrosDocumentRecordBtn, {
      props: { documentId },
      global: { plugins: [mockedI18n] }
    })
  })

  afterEach(() => wrapper.unmount())

  it('Displays expected documentId in button content', () => {
    expect(wrapper.find('button').text()).toContain(documentId)
  })

  it('Opens document record with specific documentId on click', async () => {
    const openInNewDocumentRecordSpy = vi.spyOn(wrapper.vm, 'openDocumentRecord')

    const docRecBtn = wrapper.find(`[data-cy="document-record-btn-${documentId}"]`)
    expect(docRecBtn.exists()).toBe(true)
    await docRecBtn.trigger('click')

    expect(openInNewDocumentRecordSpy).toHaveBeenCalledWith(documentId)
    openInNewDocumentRecordSpy.mockRestore()
    wrapper.unmount()
  })
})
