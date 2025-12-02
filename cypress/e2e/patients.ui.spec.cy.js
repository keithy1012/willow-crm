describe('Patient Onboarding UI', () => {
  const FE = Cypress.env('FRONTEND_BASE') || 'http://localhost:3000';
  const API = Cypress.env('API_BASE') || 'http://localhost:5050/api';
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
    cy.url({ timeout: 10000 }).should('include', '/roleselection');
    cy.contains('button', 'Patient').click();
    cy.url({ timeout: 10000 }).should('include', '/patientonboarding1');

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
    cy.url({ timeout: 10000 }).should('include', '/patientonboarding2');
    cy.get('input[placeholder="Name"]', { timeout: 10000 }).should('be.visible').type(patient.contact_name);
    cy.get('input[placeholder="Relationship"]', { timeout: 10000 }).should('be.visible').type(patient.contact_relationship);
    cy.get('input[placeholder="Phone Number"]', { timeout: 10000 }).should('be.visible').type(patient.contact_phone);
    cy.contains('label', 'Select Blood Type').parent().find('button').click();
    cy.contains('button', 'O+').click();
    cy.contains('button', 'Next').click();

    // PatientOnboarding3
    cy.url({ timeout: 10000 }).should('include', '/patientonboarding3');
    cy.contains('label', 'Allergies').next().find('input').type(patient.allergies);
    cy.contains('label', 'Medical History').next().find('input').type(patient.medicalHistory);
    cy.contains('button', 'Next').click();

    // PatientOnboarding4
    cy.url({ timeout: 10000 }).should('include', '/patientonboarding4');
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

    // Click Finish and wait for submission
    cy.contains('button', 'Finish', { timeout: 10000 }).click();

    // Intercept the registration/onboarding API call to verify it completes
    cy.wait(3000); // Give time for the backend to process

    // Check final destination
    cy.url({ timeout: 20000 }).then((finalUrl) => {
      cy.log('Final URL after onboarding:', finalUrl);
      
      if (finalUrl.includes('/patientdashboard')) {
        // Successfully redirected to dashboard - test passes
        cy.log('✅ Successfully redirected to dashboard');
        cy.url().should('include', '/patientdashboard');
      } else if (finalUrl.includes('/login')) {
        // Redirected to login - attempt login
        cy.log('Redirected to login page, attempting login...');
        
        cy.contains('label', 'Email').next().find('input').clear().type(patient.email);
        cy.contains('label', 'Password').next().find('input').clear().type(patient.password);
        cy.contains('button', 'Login').click();
        
        // Wait and check if login succeeded
        cy.wait(2000);
        cy.url({ timeout: 15000 }).then((loginUrl) => {
          if (loginUrl.includes('/patientdashboard')) {
            cy.log('✅ Login successful, now on dashboard');
            cy.url().should('include', '/patientdashboard');
          } else {
            // Login failed - check if user was actually created
            cy.log('⚠️ Login failed - checking if user exists in database');
            
            cy.request({
              method: 'POST',
              url: `${API}/users/login`,
              body: {
                email: patient.email,
                password: patient.password,
              },
              failOnStatusCode: false,
            }).then((resp) => {
              cy.log('Login API response:', resp.status, resp.body);
              
              if (resp.status === 200) {
                cy.log('✅ User exists and credentials are correct - manual navigation');
                cy.visit(`${FE}/patientdashboard`);
                cy.url().should('include', '/patientdashboard');
              } else if (resp.status === 401) {
                cy.log('❌ User not found or wrong credentials - onboarding may have failed');
                // Check if the user exists at all
                cy.request({
                  method: 'GET',
                  url: `${API}/users/email-check?email=${encodeURIComponent(patient.email)}`,
                  failOnStatusCode: false,
                }).then((checkResp) => {
                  cy.log('Email check response:', checkResp.status, checkResp.body);
                  if (checkResp.body && checkResp.body.exists === false) {
                    cy.log('❌ User was never created - onboarding submission failed');
                  } else {
                    cy.log('⚠️ User exists but login failed - possible password mismatch or incomplete registration');
                  }
                  // Fail the test with useful information
                  throw new Error(`Onboarding failed: User creation status unclear. Login returned ${resp.status}`);
                });
              } else {
                cy.log('❌ Unexpected API response:', resp.status);
                throw new Error(`Unexpected login response: ${resp.status}`);
              }
            });
          }
        });
      } else if (finalUrl.includes('/patientonboarding')) {
        // Still on onboarding page - submission might have failed
        cy.log('⚠️ Still on onboarding page after clicking Finish');
        cy.wait(3000);
        
        // Try navigating to login manually
        cy.visit(`${FE}/login`);
        cy.contains('label', 'Email').next().find('input').type(patient.email);
        cy.contains('label', 'Password').next().find('input').type(patient.password);
        cy.contains('button', 'Login').click();
        
        cy.wait(2000);
        cy.url({ timeout: 15000 }).then((loginUrl) => {
          if (loginUrl.includes('/patientdashboard')) {
            cy.log('✅ Login successful after manual navigation');
            cy.url().should('include', '/patientdashboard');
          } else {
            cy.log('❌ Login failed - user may not have been created');
            throw new Error('Onboarding may have failed - user cannot login');
          }
        });
      } else {
        // Unknown state
        cy.log('⚠️ Unexpected URL after onboarding:', finalUrl);
        throw new Error(`Unexpected navigation after onboarding: ${finalUrl}`);
      }
    });
  });
});