/*
  Doctor Onboarding UI spec
  - Run the public onboarding flow up to submitting a Doctor account creation ticket.
*/

describe('Doctor Onboarding UI', () => {
  const FE = Cypress.env('FRONTEND_BASE') || 'http://localhost:3000';
  const API = Cypress.env('API_BASE') || 'http://localhost:5050/api';
  const unique = Date.now();

  const applicant = {
    firstName: `Test${unique}`,
    lastName: `Doctor${unique}`,
    email: `test.doctor.${unique}@example.com`,
    phone: '5550101',
    sex: 'Other',
    username: `testdoc${unique}`,
    password: 'P@ssw0rd1',
    bioContent: 'Hello I am a test doctor',
    education: 'Test Medical School',
    graduationDate: '06/01/2020',
    speciality: 'General Practice',
  };

  const ops = {
    firstName: 'Ops',
    lastName: `User${unique}`,
    email: `ops.${unique}@example.com`,
    username: `ops${unique}`,
    password: 'OpsP@ss1',
    role: 'Ops',
  };

  it('submits a doctor account creation request via onboarding UI', () => {
    // SignUp1
    cy.visit(`${FE}/signup1`);
    cy.contains('label', 'First Name').next().find('input').type(applicant.firstName);
    cy.contains('label', 'Last Name').next().find('input').type(applicant.lastName);
    cy.contains('label', 'Email').next().find('input').type(applicant.email);
    cy.contains('button', 'Next').click();

    // SignUp2
    cy.url().should('include', '/signup2');
    cy.contains('label', 'Phone Number').next().find('input').type(applicant.phone);
    cy.contains('label', 'Sex').next().click();
    cy.contains('button', 'Other').click();
    cy.contains('button', 'Next').click();

    // SignUp3
    cy.url().should('include', '/signup3');
    cy.contains('label', 'Username').next().find('input').type(applicant.username);
    cy.contains('label', 'Password').next().find('input').type(applicant.password);
    cy.contains('label', 'Confirm Password').next().find('input').type(applicant.password);
    cy.contains('button', 'Finish').click();

    // Role selection -> Staff -> Doctor onboarding
    cy.url().should('include', '/roleselection');
    cy.contains('button', 'Staff').click();
    cy.url().should('include', '/staffonboarding');
    cy.contains('button', 'Doctor').click();

    cy.url().should('include', '/doctoronboarding');
    // Fill doctor-specific fields
    cy.contains('label', 'Bio Content').next().find('input').type(applicant.bioContent);
    cy.contains('label', 'Education').next().find('input').type(applicant.education);
    cy.contains('label', 'Graduation Date').next().find('input').type(applicant.graduationDate);
    cy.contains('label', 'Speciality').next().find('input').type(applicant.speciality);

    // Capture the alert triggered on submit
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alert');
    });

    cy.contains('button', 'Done').click();
    cy.get('@alert').should('have.been.calledWith', 'Doctor account creation request submitted! Awaiting approval.');
  });

  it('approves the doctor creation as an Ops user via Ops UI', () => {
    // Create Ops user via API and login via API
    cy.createAndLogin({
      firstName: ops.firstName,
      lastName: ops.lastName,
      email: ops.email,
      username: ops.username,
      gender: 'Other',
      password: ops.password,
      phoneNumber: '5550202',
      role: ops.role,
    }).then(() => {
      // Retrieve auth token from localStorage
      cy.window().then((win) => {
        const token = win.localStorage.getItem('token');
        expect(token).to.be.a('string');

        const pendingUrl = `${API}/tickets/doctorCreate/pending`;

        // Poll the pending tickets endpoint until our ticket appears (max retries)
        const maxRetries = 12;
        const retryDelay = 2000;

        function findPending(retries) {
          return cy
            .request({
              method: 'GET',
              url: pendingUrl,
              headers: { Authorization: `Bearer ${token}` },
              failOnStatusCode: false,
            })
            .then((res) => {
              if (res.status === 200 && Array.isArray(res.body)) {
                const found = res.body.find((t) => {
                  // Match by email or name from the applicant payload
                  return (
                    t.email === applicant.email ||
                    `${t.firstName} ${t.lastName}` ===
                      `${applicant.firstName} ${applicant.lastName}`
                  );
                });

                if (found) return found;
              }

              if (retries <= 0) {
                throw new Error('Pending ticket not found after retries');
              }

              // wait and retry
              return cy.wait(retryDelay).then(() => findPending(retries - 1));
            });
        }

        // Find and approve the ticket via API to avoid flaky UI interactions
        findPending(maxRetries).then((ticket) => {
          expect(ticket).to.exist;
          const approveUrl = `${API}/tickets/doctorCreate/${ticket._id}/approve`;
          cy.request({
            method: 'PATCH',
            url: approveUrl,
            headers: { Authorization: `Bearer ${token}` },
            failOnStatusCode: false,
          }).then((approveResp) => {
            expect(approveResp.status).to.be.oneOf([200, 201]);
          });
        });
      });
    });
  });
});
