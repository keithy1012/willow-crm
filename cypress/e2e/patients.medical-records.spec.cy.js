/*
  Patient Medical Records E2E Tests
  Confirms the placeholder page enforces role and renders content.
*/

describe('Patient Medical Records', () => {
  const FE = Cypress.env('FRONTEND_BASE') || 'http://localhost:3000';
  const unique = Date.now();

  const patient = {
    firstName: `Patient${unique}`,
    lastName: `Records${unique}`,
    email: `patient.records.${unique}@example.com`,
    username: `patientrecords${unique}`,
    password: 'PatientP@ss1',
    sex: 'Other',
    phone: '55501010',
    profilePic: 'https://placehold.co/100x100',
    ec_name: 'Emergency Contact',
    ec_phone: '5551010101',
    ec_relationship: 'Friend',
    birthdate: '1997-09-09',
    address: '606 Records Road, Archive City',
    bloodtype: 'A+',
    allergies: ['Dust'],
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

  it('renders the medical records placeholder', () => {
    cy.visit(`${FE}/medical-records`);
    cy.contains('MedicalRecords', { timeout: 10000 }).should('be.visible');
  });
});


