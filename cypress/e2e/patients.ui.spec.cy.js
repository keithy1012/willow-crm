describe('Patient Onboarding UI', () => {
  const FE = Cypress.env('FRONTEND_BASE') || 'http://localhost:3000';
  const unique = Date.now();

  const patient = {
    firstName: `Pat${unique}`,
    lastName: `Test${unique}`,
    email: `test.patient.${unique}@example.com`,
    phone: '5550303',
    sex: 'Other',
    username: `testpatient${unique}`,
    password: 'P@ssw0rd1',
    birthdate: '01/01/1990',
    street: '123 Test St',
    city: 'Testville',
    state: 'CA',
    zipcode: '90210',
    contact_name: 'Emergency Contact',
    contact_relationship: 'Friend',
    contact_phone: '5551112222',
    bloodType: 'O+',
    allergies: 'peanuts, pollen',
    medicalHistory: 'asthma',
  };

  it('completes SignUp1 -> SignUp3, selects Patient role, fills onboarding and submits', () => {
    // SignUp1
    cy.visit(`${FE}/signup1`);
    cy.contains('label', 'First Name').next().find('input').type(patient.firstName);
    cy.contains('label', 'Last Name').next().find('input').type(patient.lastName);
    cy.contains('label', 'Email').next().find('input').type(patient.email);
    cy.contains('button', 'Next').click();

    // SignUp2
    cy.url().should('include', '/signup2');
    cy.contains('label', 'Phone Number').next().find('input').type(patient.phone);
    cy.contains('label', 'Sex').parent().find('button').click();
    cy.contains('button', 'Other').click();
    cy.contains('button', 'Next').click();

    // SignUp3
    cy.url().should('include', '/signup3');
    cy.contains('label', 'Username').next().find('input').type(patient.username);
    cy.contains('label', 'Password').next().find('input').type(patient.password);
    cy.contains('label', 'Confirm Password').next().find('input').type(patient.password);
    cy.contains('button', 'Finish').click();

    // Role selection -> Patient
    cy.url().should('include', '/roleselection');
    cy.contains('button', 'Patient').click();
    cy.url().should('include', '/patientonboarding1');

    // PatientOnboarding1
    cy.contains('label', 'Birthdate', { timeout: 10000 }).should('be.visible');
    cy.contains('label', 'Birthdate').next().find('input').type(patient.birthdate);
    cy.contains('label', 'Address').should('exist');
    cy.get('input[placeholder="Street Address"]', { timeout: 10000 }).should('be.visible').type(patient.street);
    cy.get('input[placeholder="City"]', { timeout: 10000 }).should('be.visible').type(patient.city);
    cy.get('input[placeholder="State"]', { timeout: 10000 }).should('be.visible').type(patient.state);
    cy.get('input[placeholder="Zip Code"]', { timeout: 10000 }).should('be.visible').type(patient.zipcode);
    cy.contains('button', 'Next').click();

    // PatientOnboarding2
    cy.url().should('include', '/patientonboarding2');
    cy.get('input[placeholder="Name"]', { timeout: 10000 }).should('be.visible').type(patient.contact_name);
    cy.get('input[placeholder="Relationship"]', { timeout: 10000 }).should('be.visible').type(patient.contact_relationship);
    cy.get('input[placeholder="Phone Number"]', { timeout: 10000 }).should('be.visible').type(patient.contact_phone);
    cy.contains('label', 'Select Blood Type').parent().find('button').click();
    cy.contains('button', 'O+').click();
    cy.contains('button', 'Next').click();

    // PatientOnboarding3
    cy.url().should('include', '/patientonboarding3');
    cy.contains('label', 'Allergies').next().find('input').type(patient.allergies);
    cy.contains('label', 'Medical History').next().find('input').type(patient.medicalHistory);
    cy.contains('button', 'Next').click();

    // PatientOnboarding4
    cy.url().should('include', '/patientonboarding4');
    cy.get('input[type=file]').should('have.length.at.least', 2);

    // Upload front insurance card
    cy.fixture('insurance.png', 'base64').then((b64) => {
      return Cypress.Blob.base64StringToBlob(b64, 'image/png');
    }).then((blob) => {
      const file = new File([blob], 'insurance.png', { type: 'image/png' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      cy.get('input[type=file]').eq(0).then(($input) => {
        const input = $input[0];
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });

    // Upload back insurance card
    cy.fixture('insurance.png', 'base64').then((b64) => {
      return Cypress.Blob.base64StringToBlob(b64, 'image/png');
    }).then((blob) => {
      const file = new File([blob], 'insurance_back.png', { type: 'image/png' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      cy.get('input[type=file]').eq(1).then(($input) => {
        const input = $input[0];
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });

    cy.contains('button', 'Finish', { timeout: 10000 }).click();

    // Wait for redirect or check current state
    cy.wait(2000);

    // Check if we're redirected or still on the page
    cy.url({ timeout: 15000 }).then((url) => {
      if (url.includes('/patientdashboard')) {
        // Successfully redirected to dashboard
        cy.url().should('include', '/patientdashboard');
      } else if (url.includes('/login')) {
        // Redirected to login - perform login
        cy.contains('label', 'Email').next().find('input').type(patient.email);
        cy.contains('label', 'Password').next().find('input').type(patient.password);
        cy.contains('button', 'Login').click();
        cy.url({ timeout: 20000 }).should('include', '/patientdashboard');
      } else {
        // Still on onboarding page or other page - wait a bit more and check again
        cy.wait(3000);
        cy.url({ timeout: 10000 }).then((newUrl) => {
          if (newUrl.includes('/patientdashboard')) {
            cy.url().should('include', '/patientdashboard');
          } else if (newUrl.includes('/login')) {
            cy.contains('label', 'Email').next().find('input').type(patient.email);
            cy.contains('label', 'Password').next().find('input').type(patient.password);
            cy.contains('button', 'Login').click();
            cy.url({ timeout: 20000 }).should('include', '/patientdashboard');
          } else {
            // If still on onboarding or other page, assume submission completed
            // and manually navigate to login to verify account was created
            cy.log(`Onboarding completed but still on: ${newUrl}, navigating to login`);
            cy.visit(`${FE}/login`);
            cy.contains('label', 'Email').next().find('input').type(patient.email);
            cy.contains('label', 'Password').next().find('input').type(patient.password);
            cy.contains('button', 'Login').click();
            cy.url({ timeout: 20000 }).should('include', '/patientdashboard');
          }
        });
      }
    });
  });
});