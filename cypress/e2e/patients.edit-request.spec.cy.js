
/*
  Patient Edit Request E2E Tests
  Validates that the patient profile edit form loads and client-side validation works.
*/

describe('Patient Edit Request', () => {
  const FE = Cypress.env('FRONTEND_BASE') || 'http://localhost:3000';
  const unique = Date.now();

  const patient = {
    firstName: `Patient${unique}`,
    lastName: `Edit${unique}`,
    email: `patient.edit.${unique}@example.com`,
    username: `patientedit${unique}`,
    password: 'PatientP@ss1',
    sex: 'Other',
    phone: '5550909',
    profilePic: 'https://placehold.co/100x100',
    ec_name: 'Emergency Contact',
    ec_phone: '5558889999',
    ec_relationship: 'Partner',
    birthdate: '1996-08-08',
    address: '505 Cypress Way, Spec City',
    bloodtype: 'AB-',
    allergies: ['Cats'],
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

  it('shows the edit request form with prefilled values', () => {
    cy.visit(`${FE}/patient-profile-edit`);

    cy.contains('User Editing Settings', { timeout: 10000 }).should(
      'be.visible'
    );
    cy.get('input[name="fullName"]').should(
      'have.value',
      `${patient.firstName} ${patient.lastName}`
    );
    cy.get('input[name="email"]').should('have.value', patient.email);
    cy.get('input[name="phoneNumber"]').should('exist');
    cy.contains('Send Edit Request').should('be.visible');
  });

  it('shows validation message when submitting without changes', () => {
    cy.visit(`${FE}/patient-profile-edit`);

    cy.contains('Send Edit Request', { timeout: 10000 }).click();
    cy.contains('No changes detected.', { timeout: 10000 }).should('be.visible');
  });
});


