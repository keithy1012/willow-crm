describe('Onboarding flows (patient and doctor)', () => {
  const FE = Cypress.env('FRONTEND_BASE') || 'http://localhost:3000';
  const unique = Date.now();

  it('patient full onboarding (SignUp -> Onboarding 1-4)', () => {
    const patient = {
      firstName: `PatE2E${unique}`,
      lastName: `Test${unique}`,
      email: `pat.e2e.${unique}@example.com`,
      phone: '5550404',
      sex: 'Other',
      username: `pat_e2e_${unique}`,
      password: 'P@ssw0rd1',
      birthdate: '01/01/1990',
      street: '1 Test St',
      city: 'Testville',
      state: 'CA',
      zipcode: '90210',
      contact_name: 'EC Name',
      contact_relationship: 'Friend',
      contact_phone: '5551234567',
      bloodType: 'O+',
      allergies: 'none',
      medicalHistory: 'none',
    };

    // Sign up (1-3)
    cy.visit(`${FE}/signup1`);
    cy.contains('label', 'First Name').next().find('input').type(patient.firstName);
    cy.contains('label', 'Last Name').next().find('input').type(patient.lastName);
    cy.contains('label', 'Email').next().find('input').type(patient.email);
    cy.contains('button', 'Next').click();

    cy.url().should('include', '/signup2');
    cy.contains('label', 'Phone Number').next().find('input').type(patient.phone);
    cy.contains('label', 'Sex').parent().find('button').click();
    cy.contains('button', patient.sex).click();
    cy.contains('button', 'Next').click();

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
    cy.get('input[placeholder="Street Address"]').should('be.visible').type(patient.street);
    cy.get('input[placeholder="City"]').should('be.visible').type(patient.city);
    cy.get('input[placeholder="State"]').should('be.visible').type(patient.state);
    cy.get('input[placeholder="Zip Code"]').should('be.visible').type(patient.zipcode);
    cy.contains('button', 'Next').click();

    // PatientOnboarding2
    cy.url().should('include', '/patientonboarding2');
    cy.get('input[placeholder="Name"]').should('be.visible').type(patient.contact_name);
    cy.get('input[placeholder="Relationship"]').should('be.visible').type(patient.contact_relationship);
    cy.get('input[placeholder="Phone Number"]').should('be.visible').type(patient.contact_phone);
    cy.contains('label', 'Select Blood Type').parent().find('button').click();
    cy.contains('button', patient.bloodType).click();
    cy.contains('button', 'Next').click();

    // PatientOnboarding3
    cy.url().should('include', '/patientonboarding3');
    cy.contains('label', 'Allergies').next().find('input').type(patient.allergies);
    cy.contains('label', 'Medical History').next().find('input').type(patient.medicalHistory);
    cy.contains('button', 'Next').click();

    // PatientOnboarding4 - upload insurance
    cy.url().should('include', '/patientonboarding4');
    cy.get('input[type=file]').should('have.length.at.least', 2);
    cy.fixture('insurance.png', 'base64').then((b64) => Cypress.Blob.base64StringToBlob(b64, 'image/png')).then((blob) => {
      const file = new File([blob], 'insurance.png', { type: 'image/png' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      cy.get('input[type=file]').eq(0).then(($input) => {
        const input = $input[0];
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
    cy.fixture('insurance.png', 'base64').then((b64) => Cypress.Blob.base64StringToBlob(b64, 'image/png')).then((blob) => {
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

    // After patient creation, system redirects to login - this is expected behavior
    cy.url({ timeout: 20000 }).should('include', '/login');
    
    // Login with the newly created account
    cy.contains('label', 'Email', { timeout: 10000 }).next().find('input').type(patient.email);
    cy.contains('label', 'Password').next().find('input').type(patient.password);
    cy.contains('button', 'Login').click();
    
    // Should now be on patient dashboard
    cy.url({ timeout: 20000 }).should('include', '/patientdashboard');
  });

  it('doctor staff onboarding submits creation request', () => {
    const doc = {
      firstName: `DocE2E${unique}`,
      lastName: `Test${unique}`,
      email: `doc.e2e.${unique}@example.com`,
      phone: '5550505',
      sex: 'Other',
      username: `doc_e2e_${unique}`,
      password: 'P@ssw0rd1',
      bioContent: 'E2E test doctor',
      education: 'Test Med',
      graduationDate: '06/01/2020',
      speciality: 'General Practice',
    };

    // SignUp1-3
    cy.visit(`${FE}/signup1`);
    cy.contains('label', 'First Name').next().find('input').type(doc.firstName);
    cy.contains('label', 'Last Name').next().find('input').type(doc.lastName);
    cy.contains('label', 'Email').next().find('input').type(doc.email);
    cy.contains('button', 'Next').click();

    cy.url({ timeout: 10000 }).should('include', '/signup2');
    cy.contains('label', 'Phone Number').next().find('input').type(doc.phone);
    cy.contains('label', 'Sex').parent().find('button').click();
    cy.contains('button', doc.sex).click();
    cy.contains('button', 'Next').click();

    cy.url({ timeout: 10000 }).should('include', '/signup3');
    
    // Wait for username input to be enabled
    cy.contains('label', 'Username').next().find('input').should('not.be.disabled').type(doc.username);
    cy.contains('label', 'Password').next().find('input').type(doc.password);
    cy.contains('label', 'Confirm Password').next().find('input').type(doc.password);
    cy.contains('button', 'Finish').click();

    // Role -> Staff -> Doctor
    cy.url({ timeout: 10000 }).should('include', '/roleselection');
    cy.contains('button', 'Staff').click();
    cy.url({ timeout: 10000 }).should('include', '/staffonboarding');
    cy.contains('button', 'Doctor').click();
    cy.url({ timeout: 10000 }).should('include', '/doctoronboarding');

    // Fill doctor onboarding - wait for fields to be visible and enabled
    cy.contains('label', 'Bio Content', { timeout: 10000 })
      .next()
      .find('input,textarea')
      .should('be.visible')
      .type(doc.bioContent);
    
    cy.contains('label', 'Education')
      .next()
      .find('input')
      .should('be.visible')
      .type(doc.education);
    
    cy.contains('label', 'Graduation Date')
      .next()
      .find('input')
      .should('be.visible')
      .type(doc.graduationDate);
    
    cy.contains('label', 'Speciality')
      .next()
      .find('input')
      .should('be.visible')
      .type(doc.speciality);

    // stub alert and submit
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alertStub');
    });
    cy.contains('button', 'Done').click();
    cy.get('@alertStub').should('have.been.called');
  });
});