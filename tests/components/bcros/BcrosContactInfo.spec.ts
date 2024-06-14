import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { BcrosContactInfo } from '#components'

describe('ContactInfo tests', () => {
  it('Displays expected content', () => {
    const registriesContact = getContactInfo('registries')
    const wrapper = mount(BcrosContactInfo, { props: { contacts: registriesContact } })

    // verify content
    expect(wrapper.find('.contacts').exists()).toBe(true)
    const contacts = wrapper.findAll('.contacts__item')
    expect(contacts.length).toBe(registriesContact.length)
    for (const i in contacts) {
      expect(contacts[i].find('[data-cy="contact-icon"]').attributes().class).toContain(registriesContact[i].icon)
      expect(contacts[i].find('label').text()).toContain(registriesContact[i].label)
      expect(contacts[i].find('[data-cy="contact-value"]').text()).toContain(registriesContact[i].value)
    }

    wrapper.unmount()
  })
})
