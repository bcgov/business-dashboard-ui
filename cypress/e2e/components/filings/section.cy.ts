import { allFilings } from '../../../fixtures/filings/allFilings'
import { directorChange } from '../../../fixtures/filings/directorChange/directorChange'
import { administrativeDissolution } from '../../../fixtures/filings/dissolution/administrativeDissolution'
import { courtOrder } from '../../../fixtures/filings/staffFiling/courtOrder'
import { adminFreeze, adminFreezeWithDisplayLedgerTrue } from '../../../fixtures/filings/staffFiling/adminFreeze'
import { ContinuationRejected } from '../../../fixtures/filings/continuationApplication/continuation-rejected'
import { officerChange, pendingOfficerChange } from '../../../fixtures/filings/officerChange/officerChange'
import { appointLiquidator, ceaseLiquidator, changeAddressLiquidator, intentToLiquidate, liquidationReport, pendingAppointLiquidator, pendingCeaseLiquidator } from '../../../fixtures/filings/liquidators/liquidators'
import { appointReceiver, ceaseReceiver, amendReceiver, changeAddressReceiver, pendingAppointReceiver, pendingCeaseReceiver } from '../../../fixtures/filings/receivers/receivers'
import { BusinessRegistryStaffRoles } from '../../../../tests/test-utils/test-authorized-actions'

context('Filings history section', () => {
  it('Verifies filing history is displayed, and it shows data', () => {
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, undefined, allFilings)

    cy.get('[data-cy="filingHistoryItem-header"]').should('have.length', allFilings.length)

    cy.get('[data-cy="filingHistoryItem-header"]').each((header, index) => {
      cy.wrap(header).should('contain.text', allFilings[index].displayName)
    })
  })

  it('Verifies body of the filings -- document list, court number', () => {
    // director change verification aka, verify body list
    const filings = [directorChange, administrativeDissolution]
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, undefined, filings)

    cy.fixture('filings/directorChange/documentList.json').then((response) => {
      cy.intercept(
        'GET',
        `**/api/v2/businesses/**/filings/${directorChange.filingId}/documents`,
        response).as('directorChangeDocumentList')
    })

    cy.get('[data-cy="download-document-button-Director Change"]').should('not.exist')
    cy.get('[data-cy="download-document-button-Notice Of Articles"]').should('not.exist')
    cy.get('[data-cy="download-document-button-Receipt"]').should('not.exist')
    cy.get('[data-cy="download-document-button-downloadAll"]').should('not.exist')

    // expand filing
    cy.get(`[data-cy="filingHistoryItem-default-filing-${directorChange.filingId}"]`)
      .find('[data-cy="filing-main-action-button"]')
      .click()

    // verify document list
    cy.wait('@directorChangeDocumentList')
    cy.get('[data-cy="download-document-button-Director Change"]').should('exist')
    cy.get('[data-cy="download-document-button-Notice Of Articles"]').should('exist')
    cy.get('[data-cy="download-document-button-Receipt"]').should('exist')
    cy.get('[data-cy="download-document-button-downloadAll"]').should('exist')

    // intercept the download request and stub the response
    cy.intercept('GET', '**/api/v2/businesses/**/filings/**/documents/receipt', (req) => {
      req.on('response', (res) => {
        // Wait for 1000 milliseconds before sending the response to the client.
        res.setDelay(1000)
      })
      req.reply({ statusCode: 200 })
    }).as('downloadDocument')

    // download a single file, all document download buttons should be disabled
    cy.get('[data-cy="download-document-button-Receipt"]').click()
      .get('[data-cy="download-document-button-Director Change"]').should('be.disabled')
      .get('[data-cy="download-document-button-Notice Of Articles"]').should('be.disabled')
      .get('[data-cy="download-document-button-Receipt"]').should('be.disabled')
      .get('[data-cy="download-document-button-downloadAll"]').should('be.disabled')
      .wait('@downloadDocument')

    // contract filing
    cy.get(`[data-cy="filingHistoryItem-default-filing-${directorChange.filingId}"]`)
      .find('[data-cy="filing-main-action-button"]')
      .click()

    // administrative dissolution verification
    // expand filing
    cy.get(`[data-cy="filingHistoryItem-staff-filing-${administrativeDissolution.filingId}"]`)
      .find('[data-cy="filing-main-action-button"]')
      .click()

    // filing number
    cy.get(`[data-cy="filingHistoryItem-staff-filing-${administrativeDissolution.filingId}"]`)
      .find('[data-cy="court-order-number"]')
      .should('exist')

    cy.get(`[data-cy="filingHistoryItem-staff-filing-${administrativeDissolution.filingId}"]`)
      .find('[data-cy="pursuant-to-a-plan"]')
      .should('exist')

    // contract filing
    cy.get(`[data-cy="filingHistoryItem-staff-filing-${administrativeDissolution.filingId}`)
      .find('[data-cy="filing-main-action-button"]')
      .click()

    cy.get(`[data-cy="filingHistoryItem-staff-filing-${administrativeDissolution.filingId}"]`)
      .find('[data-cy="court-order-number"]')
      .should('not.exist')

    cy.get(`[data-cy="filingHistoryItem-staff-filing-${administrativeDissolution.filingId}"]`)
      .find('[data-cy="pursuant-to-a-plan"]')
      .should('not.exist')
  })

  it('Verifies body of the filings -- details (comments)', () => {
    const filings = [directorChange, administrativeDissolution]
    cy.fixture('filings/directorChange/commentList.json').then((response) => {
      cy.intercept(
        'GET',
        `**/api/v2/businesses/**/filings/${directorChange.filingId}/comments`,
        response).as('detailsList')
      cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, undefined, filings)

      cy.get('[data-cy="details-list"]').should('not.exist')

      // expand filing
      cy.get(`[data-cy="filingHistoryItem-default-filing-${directorChange.filingId}"]`)
        .find('[data-cy="filing-main-action-button"]')
        .click()

      // cy.wait('@detailsList')

      cy.get('[data-cy="details-list"]').should('exist')
      cy.get('[data-cy="details-list"]').contains('Details (2)')
      cy.get('[data-cy="details-list"]').contains('this is another comment... test 123')
      cy.get('[data-cy="details-list"]').contains('Test adding STAFF comments')

      // collapse filing
      cy.get(`[data-cy="filingHistoryItem-default-filing-${directorChange.filingId}"]`)
        .find('[data-cy="filing-main-action-button"]')
        .click()

      cy.get('[data-cy="details-list"]').should('not.exist')
    })
  })

  it('Verifies that if there is a court order, displays notification and verifies expanded court order', () => {
    const filings = [courtOrder]
    cy.visitBusinessDashFor('businessInfo/cc/withCourtOrder.json', undefined, false, false, undefined,
      filings, false, BusinessRegistryStaffRoles)

    // verify notification
    cy.get('[data-cy="hasCourtOrdersNotificationCard"]').should('exist')

    // intercept the GET request for the docoument list
    cy.intercept(
      'GET',
      `**/api/v2/businesses/**/filings/${courtOrder.filingId}/documents`,
      {
        documents: {
          uploadedCourtOrder:
          `sample/api/v2/businesses/somebusiness/filings/${courtOrder.filingId}/documents/uploadedCourtOrder`
        }
      }
    ).as('courtOrderDocumentList')

    // expand filing
    cy.get(`[data-cy="filingHistoryItem-staff-filing-${courtOrder.filingId}"]`)
      .find('[data-cy="filing-main-action-button"]')
      .click()
      .wait('@courtOrderDocumentList')

    // intercept the GET request for downloading the court order
    cy.intercept('GET', '**/api/v2/businesses/**/filings/**/uploadedCourtOrder').as('downloadCourtOrder')

    cy.get(`[data-cy="download-document-button-Court Order ${courtOrder.data.order.fileNumber}"]`)
      .should('exist')
      .click()
      .wait('@downloadCourtOrder')

    cy.get(`[data-cy="filingHistoryItem-staff-filing-${courtOrder.filingId}"]`)
      .contains('Pursuant to a Plan of Arrangement')
    cy.get(`[data-cy="filingHistoryItem-staff-filing-${courtOrder.filingId}"]`)
      .contains(`Court Order Number: ${courtOrder.data.order.fileNumber}`)
  })

  it('Verifies that admin freeze is not displayed (when it has displayLedger set to false)', () => {
    const filings = [courtOrder, courtOrder, adminFreeze]
    cy.visitBusinessDashFor('businessInfo/cc/withCourtOrder.json', undefined, false, false, undefined, filings)

    // verify we cant see admin freeze
    cy.contains('Admin Freeze').should('not.exist')

    cy.get('[data-cy*="filingHistoryItem-staff"]').should('have.length', 2)
  })

  it('Verifies that admin unfreeze is displayed when it has displayLedger set to true', () => {
    const filings = [adminFreeze, adminFreezeWithDisplayLedgerTrue]
    cy.visitBusinessDashFor('businessInfo/cc/withCourtOrder.json', undefined, false, false, undefined, filings)

    // verify we cant see admin freeze
    cy.contains('Admin Freeze').should('exist')

    cy.get('[data-cy*="filingHistoryItem-staff"]').should('have.length', 1)
  })

  it('Verifies body of the filings -- rejected Continuation-in Application', () => {
    cy.visitTempBusinessDash(ContinuationRejected, false)
    cy.get('[data-cy="filingHistoryItem-header"]')
      .should('have.length', 1)
      .should('contain.text', 'REJECTED')

    // expand filing
    cy.get('[data-cy="filing-main-action-button"]').click()

    cy.get('[data-cy="filingHistoryItem-body"]')
      .should('exist')
      .should('contain.text', 'Review the reasons your continuation authorization was rejected below:')
      .should('contain.text', 'Please submit a new application if you’d like to continue your business into B.C.')
  })

  it('Verifies expanded officer change if there is a officer change', () => {
    const filings = [pendingOfficerChange, officerChange]
    cy.visitBusinessDashFor('businessInfo/bc/active.json', undefined, false, false, undefined,
      filings, false, BusinessRegistryStaffRoles)

    // completed officer change.
    cy.get(`[data-cy="filingHistoryItem-default-filing-${officerChange.filingId}"]`)
      .contains('Submitted by')

    // intercept the GET request for the docoument list
    cy.intercept(
      'GET',
      `**/api/v2/businesses/**/filings/${officerChange.filingId}/documents`,
      {
        documents: {
          receipt:
          `sample/api/v2/businesses/somebusiness/filings/${officerChange.filingId}/documents/receipt`
        }
      }
    ).as('officerChangeDocumentList')

    // expand filing
    cy.get(`[data-cy="filingHistoryItem-default-filing-${officerChange.filingId}"]`, { timeout: 10000 })
      .find('[data-cy="filing-main-action-button"]')
      .click({ force: true })
      .wait('@officerChangeDocumentList')

    // intercept the GET request for downloading the court order
    cy.intercept('GET', '**/api/v2/businesses/**/filings/**/receipt').as('receipt')

    cy.get('[data-cy="download-document-button-Receipt"]', { timeout: 10000 })
      .should('exist')
      .click()
      .wait('@receipt')

    // pending officer change.
    cy.get(`[data-cy="filingHistoryItem-default-filing-${pendingOfficerChange.filingId}"]`)
      .contains('PENDING')
    cy.get(`[data-cy="filingHistoryItem-default-filing-${pendingOfficerChange.filingId}"]`)
      .contains('PAYMENT COMPLETED')

    // intercept the GET request for the docoument list
    cy.intercept(
      'GET',
      `**/api/v2/businesses/**/filings/${pendingOfficerChange.filingId}/documents`,
      {
        documents: {
          receipt:
          `sample/api/v2/businesses/somebusiness/filings/${pendingOfficerChange.filingId}/documents/receipt`
        }
      }
    ).as('pendingOfficerChangeDocumentList')

    // expand filing
    cy.get(`[data-cy="filingHistoryItem-default-filing-${pendingOfficerChange.filingId}"]`, { timeout: 10000 })
      .find('[data-cy="filing-main-action-button"]')
      .click({ force: true })
      .wait('@pendingOfficerChangeDocumentList')

    cy.get(`[data-cy="filingHistoryItem-default-filing-${pendingOfficerChange.filingId}"]`)
      .contains('Your submission is still being processed.')
    cy.get(`[data-cy="filingHistoryItem-default-filing-${pendingOfficerChange.filingId}"]`)
      .contains('Some submissions may take longer than usual to complete. If this issue continues, please contact us.')
    cy.get(`[data-cy="filingHistoryItem-default-filing-${pendingOfficerChange.filingId}"]`)
      .contains('Victoria Office')
  })

  it('Verifies liquidator filing types are displayed correctly in filing history', () => {
    const filings = [appointLiquidator, ceaseLiquidator, changeAddressLiquidator, intentToLiquidate, liquidationReport]
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, undefined, filings)

    // verify all liquidator filings are displayed with correct names
    cy.get('[data-cy="filingHistoryItem-header"]').should('have.length', filings.length)

    cy.get('[data-cy="filingHistoryItem-header"]').each((header, index) => {
      cy.wrap(header).should('contain.text', filings[index].displayName)
    })

    // verify Appoint Liquidator filing
    cy.get(`[data-cy="filingHistoryItem-default-filing-${appointLiquidator.filingId}"]`)
      .should('contain.text', 'Appoint Liquidator')

    // verify Cease Liquidator filing
    cy.get(`[data-cy="filingHistoryItem-default-filing-${ceaseLiquidator.filingId}"]`)
      .should('contain.text', 'Cease Liquidator')

    // verify Liquidator Change of Address filing
    cy.get(`[data-cy="filingHistoryItem-default-filing-${changeAddressLiquidator.filingId}"]`)
      .should('contain.text', 'Liquidator Change of Address')

    // verify Intent to Liquidate filing
    cy.get(`[data-cy="filingHistoryItem-default-filing-${intentToLiquidate.filingId}"]`)
      .should('contain.text', 'Intent to Liquidate')

    // verify Liquidation Report filing
    cy.get(`[data-cy="filingHistoryItem-default-filing-${liquidationReport.filingId}"]`)
      .should('contain.text', 'Liquidation Report')
  })

  it('Verifies liquidator filing expansion and document download', () => {
    const filings = [appointLiquidator]
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, undefined, filings)

    // intercept the GET request for the document list
    cy.intercept(
      'GET',
      `**/api/v2/businesses/**/filings/${appointLiquidator.filingId}/documents`,
      {
        documents: {
          receipt:
          `sample/api/v2/businesses/somebusiness/filings/${appointLiquidator.filingId}/documents/receipt`
        }
      }
    ).as('liquidatorDocumentList')

    // expand filing
    cy.get(`[data-cy="filingHistoryItem-default-filing-${appointLiquidator.filingId}"]`)
      .find('[data-cy="filing-main-action-button"]')
      .click()
      .wait('@liquidatorDocumentList')

    // verify document button exists
    cy.get('[data-cy="download-document-button-Receipt"]').should('exist')

    // intercept the GET request for downloading the document
    cy.intercept('GET', '**/api/v2/businesses/**/filings/**/receipt').as('receipt')

    cy.get('[data-cy="download-document-button-Receipt"]')
      .click()
      .wait('@receipt')

    // collapse filing
    cy.get(`[data-cy="filingHistoryItem-default-filing-${appointLiquidator.filingId}"]`)
      .find('[data-cy="filing-main-action-button"]')
      .click()

    // verify document button is hidden after collapse
    cy.get('[data-cy="download-document-button-Receipt"]').should('not.exist')
  })

  it('Verifies receiver filing types are displayed correctly in filing history', () => {
    const filings = [appointReceiver, ceaseReceiver, amendReceiver, changeAddressReceiver]
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, undefined, filings)

    // verify all receiver filings are displayed with correct names
    cy.get('[data-cy="filingHistoryItem-header"]').should('have.length', filings.length)

    cy.get('[data-cy="filingHistoryItem-header"]').each((header, index) => {
      cy.wrap(header).should('contain.text', filings[index].displayName)
    })

    // verify Appoint Receiver filing
    cy.get(`[data-cy="filingHistoryItem-default-filing-${appointReceiver.filingId}"]`)
      .should('contain.text', 'Appoint Receiver')

    // verify Cease Receiver filing
    cy.get(`[data-cy="filingHistoryItem-default-filing-${ceaseReceiver.filingId}"]`)
      .should('contain.text', 'Cease Receiver')

    // verify Amend Receiver filing
    cy.get(`[data-cy="filingHistoryItem-default-filing-${amendReceiver.filingId}"]`)
      .should('contain.text', 'Amend Receiver')

    // verify Receiver Change of Address filing
    cy.get(`[data-cy="filingHistoryItem-default-filing-${changeAddressReceiver.filingId}"]`)
      .should('contain.text', 'Receiver Change of Address')
  })

  it('Verifies receiver filing expansion and document download', () => {
    const filings = [appointReceiver]
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, undefined, filings)

    // intercept the GET request for the document list
    cy.intercept(
      'GET',
      `**/api/v2/businesses/**/filings/${appointReceiver.filingId}/documents`,
      {
        documents: {
          receipt:
          `sample/api/v2/businesses/somebusiness/filings/${appointReceiver.filingId}/documents/receipt`
        }
      }
    ).as('receiverDocumentList')

    // expand filing
    cy.get(`[data-cy="filingHistoryItem-default-filing-${appointReceiver.filingId}"]`)
      .find('[data-cy="filing-main-action-button"]')
      .click()
      .wait('@receiverDocumentList')

    // verify document button exists
    cy.get('[data-cy="download-document-button-Receipt"]').should('exist')

    // intercept the GET request for downloading the document
    cy.intercept('GET', '**/api/v2/businesses/**/filings/**/receipt').as('receipt')

    cy.get('[data-cy="download-document-button-Receipt"]')
      .click()
      .wait('@receipt')

    // collapse filing
    cy.get(`[data-cy="filingHistoryItem-default-filing-${appointReceiver.filingId}"]`)
      .find('[data-cy="filing-main-action-button"]')
      .click()

    // verify document button is hidden after collapse
    cy.get('[data-cy="download-document-button-Receipt"]').should('not.exist')
  })

  it('Verifies pending liquidator filings are displayed with correct status', () => {
    const filings = [pendingAppointLiquidator, pendingCeaseLiquidator]
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, undefined, filings)

    // verify all pending liquidator filings are displayed
    cy.get('[data-cy="filingHistoryItem-header"]').should('have.length', filings.length)

    cy.get('[data-cy="filingHistoryItem-header"]').each((header, index) => {
      cy.wrap(header).should('contain.text', filings[index].displayName)
    })

    // verify Appoint Liquidator pending filing shows PENDING status
    cy.get(`[data-cy="filingHistoryItem-default-filing-${pendingAppointLiquidator.filingId}"]`)
      .should('contain.text', 'Appoint Liquidator')
      .should('contain.text', 'PENDING')

    // verify Cease Liquidator pending filing shows PENDING status
    cy.get(`[data-cy="filingHistoryItem-default-filing-${pendingCeaseLiquidator.filingId}"]`)
      .should('contain.text', 'Cease Liquidator')
      .should('contain.text', 'PENDING')
  })

  it('Verifies pending receiver filings are displayed with correct status', () => {
    const filings = [pendingAppointReceiver, pendingCeaseReceiver]
    cy.visitBusinessDashFor('businessInfo/ben/active.json', undefined, false, false, undefined, filings)

    // verify all pending receiver filings are displayed
    cy.get('[data-cy="filingHistoryItem-header"]').should('have.length', filings.length)

    cy.get('[data-cy="filingHistoryItem-header"]').each((header, index) => {
      cy.wrap(header).should('contain.text', filings[index].displayName)
    })

    // verify Appoint Receiver pending filing shows PENDING status
    cy.get(`[data-cy="filingHistoryItem-default-filing-${pendingAppointReceiver.filingId}"]`)
      .should('contain.text', 'Appoint Receiver')
      .should('contain.text', 'PENDING')

    // verify Cease Receiver pending filing shows PENDING status
    cy.get(`[data-cy="filingHistoryItem-default-filing-${pendingCeaseReceiver.filingId}"]`)
      .should('contain.text', 'Cease Receiver')
      .should('contain.text', 'PENDING')
  })
})
