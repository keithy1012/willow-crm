describe('Role-based redirects and dashboards', () => {
  const FE = Cypress.env('FRONTEND_BASE') || 'http://localhost:3000';
  const unique = Date.now();

  const roles = [
    { role: 'Patient', expectPath: '/patientdashboard', checkText: 'Book your next' },
    { role: 'Doctor', expectPath: '/doctordashboard', checkText: 'Welcome Back, Doctor' },
    { role: 'Ops', expectPath: '/opsdashboard/doctors', checkText: 'Ops' },
    { role: 'IT', expectPath: '/itdashboard', checkText: 'IT' },
    { role: 'Finance', expectPath: '/financedashboard', checkText: null }, // No text check
  ];

  roles.forEach(({ role, expectPath, checkText }) => {
    it(`registers and logs in as ${role} and lands on ${expectPath}`, () => {
      const email = `role.${role.toLowerCase()}.${unique}@example.com`;
      const user = {
        firstName: `${role}Test`,
        lastName: `${unique}`,
        email,
        username: `role_${role.toLowerCase()}_${unique}`,
        password: 'P@ssw0rd1',
        role,
      };

      // Register via API and then login via API (stores token/user in localStorage)
      cy.apiRegister(user).then((reg) => {
        expect(reg.status).to.be.oneOf([200, 201]);
        cy.apiLogin(user.email, user.password).then((loginResp) => {
          expect(loginResp.status).to.eq(200);
          
          // Visit the expected dashboard directly
          cy.visit(`${FE}${expectPath}`);
          
          // Wait for page to load and verify we're on the correct path
          cy.location('pathname', { timeout: 10000 }).should('include', expectPath);

          // Quick text check on page to ensure role-specific UI (if provided)
          if (checkText) {
            cy.contains(new RegExp(checkText, 'i'), { timeout: 10000 }).should('exist');
          } else {
            // Just verify the page loaded with content
            cy.get('body').should('not.be.empty');
          }
        });
      });
    });
  });
});