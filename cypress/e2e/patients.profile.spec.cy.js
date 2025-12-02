/*
  Patient Profile E2E Tests
  Verifies patient profile surfaces and navigation to edit request page.
*/

describe('Patient Profile', () => {
  const FE = Cypress.env('FRONTEND_BASE') || 'http://localhost:3000';
  const unique = Date.now();

  const patient = {
    firstName: `Patient${unique}`,
    lastName: `Profile${unique}`,
    email: `patient.profile.${unique}@example.com`,
    username: `patientprofile${unique}`,
    password: 'PatientP@ss1',
    sex: 'Other',
    phone: '5550404',
    profilePic: 'https://placehold.co/100x100',
    ec_name: 'Emergency Contact',
    ec_phone: '5551234567',
    ec_relationship: 'Parent',
    birthdate: '1989-03-03',
    address: '789 Sample Road, Demo City',
    bloodtype: 'B+',
    allergies: ['Pollen', 'Shellfish'],
    medicalHistory: ['Hypertension'],
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

  it('displays profile header and key sections', () => {
    cy.visit(`${FE}/patient-profile`);

    cy.contains(`${patient.firstName}'s Patient Profile`, {
      timeout: 10000,
    }).should('be.visible');
    cy.contains('Patient Information', { timeout: 10000 }).should('be.visible');
    cy.contains('Contact Information', { timeout: 10000 }).should('be.visible');
    cy.contains('Patient Medical History').should('be.visible');
    cy.contains('Patient Allergies').should('be.visible');
  });

  it('navigates to edit request screen when clicking the edit icon', () => {
    cy.visit(`${FE}/patient-profile`);

    // Wait for the profile to load by checking for the header
    cy.contains(`${patient.firstName}'s Patient Profile`, {
      timeout: 10000,
    }).should('be.visible');

    // Wait for patient data to be fully loaded
    cy.contains('Patient Information', { timeout: 10000 }).should('be.visible');

    // Find the SVG pencil icon next to the patient profile heading
    // The PencilSimple component renders as an SVG with specific classes
    cy.contains(`${patient.firstName}'s Patient Profile`)
      .parent()
      .find('svg', { timeout: 10000 })
      .should('be.visible')
      .click();

    cy.url({ timeout: 10000 }).should('include', '/patient-profile-edit');
    cy.contains('User Editing Settings', { timeout: 10000 }).should(
      'be.visible'
    );
  });
});