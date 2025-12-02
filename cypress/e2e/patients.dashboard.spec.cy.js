/*
  Patient Dashboard E2E Tests
  Covers key dashboard surfaces for patient users:
  - Hero search and chatbot sections
  - Medication preview empty state
  - Upcoming appointments section
*/

describe('Patient Dashboard', () => {
  const FE = Cypress.env('FRONTEND_BASE') || 'http://localhost:3000';
  const unique = Date.now();

  const patient = {
    firstName: `Patient${unique}`,
    lastName: `Dash${unique}`,
    email: `patient.dashboard.${unique}@example.com`,
    username: `patientdash${unique}`,
    password: 'PatientP@ss1',
    sex: 'Other',
    phone: '5550300',
    profilePic: 'https://placehold.co/100x100',
    ec_name: 'Emergency Contact',
    ec_phone: '5551112222',
    ec_relationship: 'Friend',
    birthdate: '1990-01-01',
    address: '123 Main Street, Testville',
    bloodtype: 'O+',
    allergies: ['Peanuts'],
    medicalHistory: ['Asthma'],
    insuranceCardFront: null,
    insuranceCardBack: null,
  };

  let patientId;

  before(() => {
    cy.createPatientAccount(patient).then((resp) => {
      expect(resp.status).to.be.oneOf([200, 201]);
      patientId = resp.body.patient?._id || resp.body.patientId;
      expect(patientId, 'patient id').to.exist;
    });
  });

  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.clear();
    });
    cy.apiLogin(patient.email, patient.password);
  });

  it('shows the hero search and chatbot entry', () => {
    cy.visit(`${FE}/patientdashboard`);

    cy.contains("Book your next Doctor's Appointment", {
      timeout: 10000,
    }).should('be.visible');
    cy.contains('button', 'Search', { timeout: 10000 }).should('be.visible');
    cy.contains('Ask me a question', { timeout: 10000 }).should('be.visible');
    cy.contains('button', 'Submit').should('exist');
  });

  it('displays medication preview with empty state messaging', () => {
    cy.visit(`${FE}/patientdashboard`);

    cy.contains('My Medications', { timeout: 10000 }).should('be.visible');
    cy.contains('Preview your medications here.', { timeout: 10000 }).should(
      'be.visible'
    );
    cy.contains('No medications prescribed yet', { timeout: 10000 }).should(
      'be.visible'
    );
  });

  it('shows upcoming appointments section with guidance', () => {
    cy.visit(`${FE}/patientdashboard`);

    cy.contains('Upcoming Appointments', { timeout: 10000 }).should(
      'be.visible'
    );
    cy.contains('Look at your upcoming appointment details here.', {
      timeout: 10000,
    }).should('be.visible');

    // Wait for appointments API to complete
    cy.wait(2000);

    cy.get('body').then(($body) => {
      const bodyText = $body.text();
      
      if (
        bodyText.includes('No upcoming appointments') ||
        bodyText.includes('no upcoming appointments')
      ) {
        // Empty state - verify it shows appropriate message
        cy.log('No appointments found - empty state');
        // Just verify the section loaded, empty state is acceptable
      } else {
        // Has appointments - look for appointment cards or list items
        cy.get('[class*="appointment"], [data-testid*="appointment"], table tr', {
          timeout: 5000
        }).should('have.length.at.least', 1);
      }
    });
  });
});