/*
  Patient Insurance E2E Tests
  Ensures insurance cards page loads and handles missing uploads gracefully.
*/

describe('Patient Insurance', () => {
  const FE = Cypress.env('FRONTEND_BASE') || 'http://localhost:3000';
  const unique = Date.now();

  const patient = {
    firstName: `Patient${unique}`,
    lastName: `Insurance${unique}`,
    email: `patient.insurance.${unique}@example.com`,
    username: `patientinsurance${unique}`,
    password: 'PatientP@ss1',
    sex: 'Other',
    phone: '5550606',
    profilePic: 'https://placehold.co/100x100',
    ec_name: 'Emergency Contact',
    ec_phone: '5553334444',
    ec_relationship: 'Partner',
    birthdate: '1993-05-05',
    address: '202 Sample Street, Demo Town',
    bloodtype: 'O-',
    allergies: ['None'],
    medicalHistory: ['Healthy'],
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

  it('shows insurance information layout and placeholders for missing cards', () => {
    cy.visit(`${FE}/insurance`);

    cy.contains('Insurance Information', { timeout: 10000 }).should(
      'be.visible'
    );
    cy.contains('Front of Card', { timeout: 10000 }).should('be.visible');
    cy.contains('Back of Card', { timeout: 10000 }).should('be.visible');
    cy.contains('Front card not uploaded', { timeout: 10000 }).should(
      'be.visible'
    );
    cy.contains('Back card not uploaded', { timeout: 10000 }).should(
      'be.visible'
    );
  });
});


