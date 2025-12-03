describe('Auth flows (signup, login, forgot password)', () => {
  const FE = Cypress.env('FRONTEND_BASE') || 'http://localhost:3000';
  const unique = Date.now();

  it('signs up a new user through the UI and reaches role selection', () => {
    const user = {
      firstName: `Auth${unique}`,
      lastName: `Test${unique}`,
      email: `auth.user.${unique}@example.com`,
      phone: '5550001',
      sex: 'Other',
      username: `authuser${unique}`,
      password: 'P@ssw0rd1',
    };

    // SignUp1
    cy.visit(`${FE}/signup1`);
    cy.contains('label', 'First Name').next().find('input').type(user.firstName);
    cy.contains('label', 'Last Name').next().find('input').type(user.lastName);
    cy.contains('label', 'Email').next().find('input').type(user.email);
    cy.contains('button', 'Next').click();

    // SignUp2
    cy.url().should('include', '/signup2');
    cy.contains('label', 'Phone Number').next().find('input').type(user.phone);
    cy.contains('label', 'Sex').parent().find('button').click();
    cy.contains('button', user.sex).click();
    cy.contains('button', 'Next').click();

    // SignUp3
    cy.url().should('include', '/signup3');
    cy.contains('label', 'Username').next().find('input').type(user.username);
    cy.contains('label', 'Password').next().find('input').type(user.password);
    cy.contains('label', 'Confirm Password').next().find('input').type(user.password);
    cy.contains('button', 'Finish').click();

    // Role selection should appear
    cy.url({ timeout: 10000 }).should('include', '/roleselection');
    cy.contains('button', 'Patient').should('be.visible');
  });

  it('can login using API-created user and reach protected route', () => {
    const regUser = {
      firstName: `Api${unique}`,
      lastName: `Login${unique}`,
      email: `api.login.${unique}@example.com`,
      username: `apilogin${unique}`,
      password: 'P@ssw0rd1',
      role: 'Patient',
    };

    // Create user via API then login through UI
    cy.apiRegister(regUser).then((resp) => {
      expect(resp.status).to.be.oneOf([200, 201]);
      cy.visit(`${FE}/login`);
      cy.contains('label', 'Email').next().find('input').type(regUser.email);
      cy.contains('label', 'Password').next().find('input').type(regUser.password);
      cy.contains('button', /login|Log in|Sign in/i).click();
      // Patient default route
      cy.url({ timeout: 10000 }).should('include', '/patientdashboard');
    });
  });

  it('submits forgot password and shows confirmation', () => {
    const fpUser = {
      firstName: `FP${unique}`,
      lastName: `User${unique}`,
      email: `fp.user.${unique}@example.com`,
      username: `fpuser${unique}`,
      password: 'P@ssw0rd1',
      role: 'Patient',
    };

    // Create user via API to ensure email exists (endpoint responds the same even if it doesn't)
    cy.apiRegister(fpUser).its('status').should('be.oneOf', [200, 201]);

    cy.visit(`${FE}/forgotpassword`);
    cy.contains('label', 'Email').next().find('input').type(fpUser.email);
    cy.contains('button', /Send Reset Link/i).click();
    cy.contains('If an account exists for this email', { timeout: 10000 }).should('exist');
  });
});
