import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import { BcrosDocumentRecordBtn } from '#components'

describe('DocumentRecordBtn tests', () => {
  const documentId = '12345'

  it('Displays expected content', () => {
    const wrapper = mount(BcrosDocumentRecordBtn, { props: { documentId } })
    expect(wrapper.find('button').text()).toContain(`Manage Document Record ${documentId}`)
    wrapper.unmount()
  })

  it('Opens document record with specific documentId on click', async () => {
    const wrapper = mount(BcrosDocumentRecordBtn, { props: { documentId } })
    const openInNewDocumentRecordSpy = vi.spyOn(wrapper.vm, 'openDocumentRecord')

    const docRecBtn = wrapper.find(`[data-cy="document-record-btn-${documentId}"]`)
    expect(docRecBtn.exists()).toBe(true)
    await docRecBtn.trigger('click')

    expect(openInNewDocumentRecordSpy).toHaveBeenCalledWith(documentId)
    openInNewDocumentRecordSpy.mockRestore()
    wrapper.unmount()
  })
})
