/*
  Patient Messages E2E Tests
  Validates that the messaging experience loads for patient users.
*/

describe('Patient Messages', () => {
  const FE = Cypress.env('FRONTEND_BASE') || 'http://localhost:3000';
  const unique = Date.now();

  const patient = {
    firstName: `Patient${unique}`,
    lastName: `Messages${unique}`,
    email: `patient.messages.${unique}@example.com`,
    username: `patientmessages${unique}`,
    password: 'PatientP@ss1',
    sex: 'Other',
    phone: '5550707',
    profilePic: 'https://placehold.co/100x100',
    ec_name: 'Emergency Contact',
    ec_phone: '5554445555',
    ec_relationship: 'Sibling',
    birthdate: '1994-06-06',
    address: '303 Example Lane, Demo City',
    bloodtype: 'A-',
    allergies: ['Grass'],
    medicalHistory: ['Seasonal Allergies'],
    insuranceCardFront: null,
    insuranceCardBack: null,
  };

  before(() => {
    cy.createPatientAccount(patient).then((resp) => {
      expect(resp.status).to.be.oneOf([200, 201]);
      expect(resp.body.patient?._id || resp.body.patientId).to.exist;
    });
  });

  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.clear();
    });
    cy.apiLogin(patient.email, patient.password);
  });

  it('loads the messaging layout and shows default state', () => {
    cy.visit(`${FE}/messages`);

    // Wait for the main heading to appear, indicating the page has loaded
    cy.contains('Doctor Messages', { timeout: 15000 }).should('be.visible');

    // Check if the empty state message appears (for a new patient with no messages)
    cy.get('body', { timeout: 10000 }).should(($body) => {
      const bodyText = $body.text();
      const hasEmptyState = bodyText.includes('You have no messages yet');
      const hasLoadingState = bodyText.includes('Loading');
      
      // Should show either the empty state or have finished loading
      expect(hasEmptyState || !hasLoadingState).to.be.true;
    });

    // If we see the empty state, verify the full message
    cy.get('body').then(($body) => {
      if ($body.text().includes('You have no messages yet')) {
        cy.contains(
          'You have no messages yet. Start a new conversation to begin chatting.'
        ).should('be.visible');
      }
    });
  });
});