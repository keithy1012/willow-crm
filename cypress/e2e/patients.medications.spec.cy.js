/*
  Patient Medications E2E Tests
  Validates the medications page layout and helper content.
*/

describe('Patient Medications', () => {
  const FE = Cypress.env('FRONTEND_BASE') || 'http://localhost:3000';
  const unique = Date.now();

  const patient = {
    firstName: `Patient${unique}`,
    lastName: `Meds${unique}`,
    email: `patient.meds.${unique}@example.com`,
    username: `patientmeds${unique}`,
    password: 'PatientP@ss1',
    sex: 'Other',
    phone: '5550505',
    profilePic: 'https://placehold.co/100x100',
    ec_name: 'Emergency Contact',
    ec_phone: '5557654321',
    ec_relationship: 'Spouse',
    birthdate: '1992-04-04',
    address: '101 Example Blvd, Sample City',
    bloodtype: 'AB+',
    allergies: ['Latex'],
    medicalHistory: ['Allergies'],
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

  it('shows medications header and empty state message', () => {
    cy.visit(`${FE}/medications`);

    cy.contains('My Medications', { timeout: 10000 }).should('be.visible');
    cy.contains('No medications found', { timeout: 10000 }).should(
      'be.visible'
    );
    cy.contains('Your prescribed medications will appear here').should(
      'be.visible'
    );
  });

  it('displays refill guidance and important information panel', () => {
    cy.visit(`${FE}/medications`);

    cy.contains('Requesting a Refill', { timeout: 10000 }).should('be.visible');
    cy.contains('Need a new prescription?', { timeout: 10000 }).should(
      'be.visible'
    );
    cy.contains('Important Information', { timeout: 10000 }).should(
      'be.visible'
    );
    
    // Scroll to the "Need Help?" section to make it visible
    cy.contains('Need Help?', { timeout: 10000 })
      .scrollIntoView()
      .should('be.visible');
  });
});