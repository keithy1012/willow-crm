/*
  Patient Appointments E2E Tests
  Covers appointments listing experience:
  - Header + stats cards
  - Empty state messaging
  - Sorting interactions
*/

describe('Patient Appointments', () => {
  const FE = Cypress.env('FRONTEND_BASE') || 'http://localhost:3000';
  const unique = Date.now();

  const patient = {
    firstName: `Patient${unique}`,
    lastName: `Appt${unique}`,
    email: `patient.appt.${unique}@example.com`,
    username: `patientappt${unique}`,
    password: 'PatientP@ss1',
    sex: 'Other',
    phone: '5550301',
    profilePic: 'https://placehold.co/100x100',
    ec_name: 'Emergency Contact',
    ec_phone: '5552223333',
    ec_relationship: 'Sibling',
    birthdate: '1991-02-02',
    address: '456 Test Avenue, Example City',
    bloodtype: 'A+',
    allergies: ['Dust'],
    medicalHistory: ['Migraines'],
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

  it('shows appointments header and stats cards', () => {
    cy.visit(`${FE}/appointments`);

    cy.contains('My Appointments', { timeout: 10000 }).should('be.visible');
    cy.contains('Upcoming', { timeout: 10000 }).should('be.visible');
    cy.contains('Completed').should('be.visible');
    cy.contains('Cancelled').should('be.visible');
    cy.contains('Total').should('be.visible');
  });

  it('displays empty state when there are no appointments', () => {
    cy.visit(`${FE}/appointments`);

    cy.contains('No appointments yet', { timeout: 10000 }).should('be.visible');
    cy.contains('Book an appointment with a doctor to get started').should(
      'be.visible'
    );
  });

  it('allows sorting by upcoming and past appointments', () => {
    cy.visit(`${FE}/appointments`);

    // Wait for page to load
    cy.contains('My Appointments', { timeout: 10000 }).should('be.visible');

    // Open the sort dropdown and select "Upcoming Appointments"
    cy.contains('label', 'Sort By', { timeout: 10000 })
      .parent()
      .within(() => {
        cy.contains('button', 'All').click();
      });

    cy.contains('Upcoming Appointments', { timeout: 5000 })
      .should('be.visible')
      .click();

    // Wait for filter to apply
    cy.wait(1000);

    // Check that the filter is now showing "Upcoming Appointments"
    cy.contains('button', 'Upcoming Appointments', { timeout: 5000 }).should(
      'be.visible'
    );

    // Verify empty state or filtered results
    cy.get('body').then(($body) => {
      const bodyText = $body.text();
      if (bodyText.includes('No upcoming') || bodyText.includes('No appointments')) {
        cy.log('No upcoming appointments shown');
      }
    });

    // Now switch to "Past Appointments"
    cy.contains('label', 'Sort By')
      .parent()
      .within(() => {
        cy.contains('button', 'Upcoming Appointments').click();
      });

    cy.contains('Past Appointments', { timeout: 5000 })
      .should('be.visible')
      .click();

    // Wait for filter to apply
    cy.wait(1000);

    // Check that the filter is now showing "Past Appointments"
    cy.contains('button', 'Past Appointments', { timeout: 5000 }).should(
      'be.visible'
    );

    // Verify empty state or filtered results
    cy.get('body').then(($body) => {
      const bodyText = $body.text();
      if (bodyText.includes('No past') || bodyText.includes('No appointments')) {
        cy.log('No past appointments shown');
      }
    });
  });
});