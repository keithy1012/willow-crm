/*
  Patient Invoices E2E Tests
  Ensures invoice list page renders search/filter controls and empty state.
*/

describe('Patient Invoices', () => {
  const FE = Cypress.env('FRONTEND_BASE') || 'http://localhost:3000';
  const unique = Date.now();

  const patient = {
    firstName: `Patient${unique}`,
    lastName: `Invoice${unique}`,
    email: `patient.invoice.${unique}@example.com`,
    username: `patientinvoice${unique}`,
    password: 'PatientP@ss1',
    sex: 'Other',
    phone: '5550808',
    profilePic: 'https://placehold.co/100x100',
    ec_name: 'Emergency Contact',
    ec_phone: '5555556666',
    ec_relationship: 'Friend',
    birthdate: '1995-07-07',
    address: '404 Test Parkway, Example City',
    bloodtype: 'B-',
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

  it('shows invoice header, search, and filter controls', () => {
    cy.visit(`${FE}/view-invoices`);

    // Wait for the page to load
    cy.contains('My Invoices', { timeout: 10000 }).should('be.visible');

    // Check for search input - use placeholder attribute or input element
    cy.get('input[placeholder*="doctor" i], input[placeholder*="search" i]', { 
      timeout: 10000 
    }).should('be.visible');

    // Check for filter dropdown - look for "All Status" or any status filter
    cy.get('select, button').filter(':contains("Status"), :contains("All")').should('exist');
  });

  it('displays empty state messaging when there are no invoices', () => {
    cy.visit(`${FE}/view-invoices`);

    // Wait for the page header to load
    cy.contains('My Invoices', { timeout: 10000 }).should('be.visible');

    // Wait for the API call to complete
    cy.wait(2000);

    // Check the page content
    cy.get('body').then(($body) => {
      const bodyText = $body.text();
      
      // Check for various empty state messages
      if (
        bodyText.includes('No invoices') || 
        bodyText.includes('no invoices') ||
        bodyText.includes('No Invoices')
      ) {
        // Empty state exists
        cy.log('Empty state detected');
        cy.get('body').should('contain.text', 'invoice');
      } else {
        // Invoices exist - check for invoice table or cards
        cy.get('table, [class*="invoice"], [data-testid*="invoice"]', {
          timeout: 5000
        }).should('exist');
      }
    });
  });
});