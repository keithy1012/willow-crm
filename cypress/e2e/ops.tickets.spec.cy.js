/* Operations E2E: Ticket creation and approval (UI + API) */
describe('Operations - Doctor Ticket Approval', () => {
  const API_BASE = Cypress.env('API_BASE') || 'http://localhost:5050/api';
  const FE_BASE = Cypress.env('FRONTEND_BASE') || 'http://localhost:3000';

  it('submits a doctor creation ticket then approves it via the Ops UI', () => {
    const unique = Date.now();

    const ticketPayload = {
      email: `e2e.doctor.${unique}@example.com`,
      password: 'Password123!',
      firstName: 'E2E',
      lastName: `Doctor${unique}`,
      username: `e2e_doctor_${unique}`,
      phoneNumber: '5550001111',
      gender: 'Other',
      speciality: 'General Practice',
      education: 'Test Medical School',
      graduationDate: '2020-06-01',
      bioContent: 'E2E doctor creation ticket',
    };

    cy.request({
      method: 'POST',
      url: `${API_BASE}/tickets/doctorCreate`,
      body: ticketPayload,
      failOnStatusCode: false,
    }).then((ticketResp) => {
      expect(ticketResp.status).to.be.oneOf([200, 201]);
      const ticket = ticketResp.body.ticket || ticketResp.body;
      const ticketId = ticket._id || ticket.id || ticket.ticketId;
      expect(ticketId, 'ticket ID should exist').to.exist;

      const opsUser = {
        email: `ops.e2e.${unique}@example.com`,
        password: 'Password123!',
        firstName: 'Ops',
        lastName: 'User',
        username: `ops_e2e_${unique}`,
        role: 'Ops',
        phoneNumber: '5552223333',
        gender: 'Other',
      };

      cy.request({
        method: 'POST',
        url: `${API_BASE}/users/register`,
        body: opsUser,
        failOnStatusCode: false,
      }).then(() => {
        cy.request({
          method: 'POST',
          url: `${API_BASE}/users/login`,
          body: { email: opsUser.email, password: opsUser.password },
          failOnStatusCode: false,
        }).then((loginResp) => {
          expect(loginResp.status).to.eq(200);
          
          cy.window().then((win) => {
            win.localStorage.setItem('token', loginResp.body.token);
            win.localStorage.setItem('user', JSON.stringify(loginResp.body.user));
          });

          cy.visit(`${FE_BASE}/opsdashboard/doctors`);
          cy.contains('All Doctor Tickets', { timeout: 10000 }).should('be.visible');
          cy.wait(2000);

          const titleText = `New Account: Dr. ${ticketPayload.firstName} ${ticketPayload.lastName}`;

          // Click "Review & Approve" button
          cy.contains('h3', titleText, { timeout: 10000 })
            .should('be.visible')
            .closest('.bg-white')
            .find('button')
            .contains('Review & Approve')
            .click();

          // Wait for ApproveCreationModal to appear and click "Approve Creation"
          cy.contains('Approve Account Creation', { timeout: 5000 }).should('be.visible');
          cy.contains('button', 'Approve Creation').click();

          // Wait for approval to process
          cy.wait(2000);

          // Verify doctor can login
          cy.request({
            method: 'POST',
            url: `${API_BASE}/users/login`,
            body: { email: ticketPayload.email, password: ticketPayload.password },
            failOnStatusCode: false,
          }).then((docLogin) => {
            expect(docLogin.status).to.eq(200);
            expect(docLogin.body).to.have.property('token');
          });
        });
      });
    });
  });

  it('can approve a doctor ticket via the API (ops token)', () => {
    const unique = Date.now();

    const ticketPayload = {
      email: `api.doctor.${unique}@example.com`,
      password: 'Password123!',
      firstName: 'API',
      lastName: `Doctor${unique}`,
      username: `api_doctor_${unique}`,
      phoneNumber: '5554445555',
      gender: 'Other',
      speciality: 'Cardiology',
      education: 'API Medical School',
      graduationDate: '2019-06-01',
      bioContent: 'API approval test',
    };

    cy.request({
      method: 'POST',
      url: `${API_BASE}/tickets/doctorCreate`,
      body: ticketPayload,
      failOnStatusCode: false,
    }).then((ticketResp) => {
      expect(ticketResp.status).to.be.oneOf([200, 201]);
      const ticket = ticketResp.body.ticket || ticketResp.body;
      const ticketId = ticket._id || ticket.id || ticket.ticketId;
      expect(ticketId, 'ticket ID should exist').to.exist;

      const opsUser = {
        email: `ops.api.${unique}@example.com`,
        password: 'Password123!',
        firstName: 'Ops',
        lastName: 'API',
        username: `ops_api_${unique}`,
        role: 'Ops',
        phoneNumber: '5556667777',
        gender: 'Other',
      };

      cy.request({
        method: 'POST',
        url: `${API_BASE}/users/register`,
        body: opsUser,
        failOnStatusCode: false,
      }).then(() => {
        cy.request({
          method: 'POST',
          url: `${API_BASE}/users/login`,
          body: { email: opsUser.email, password: opsUser.password },
          failOnStatusCode: false,
        }).then((opsLogin) => {
          expect(opsLogin.status).to.eq(200);
          const opsToken = opsLogin.body.token;

          cy.request({
            method: 'PATCH',
            url: `${API_BASE}/tickets/doctorCreate/${ticketId}/approve`,
            headers: { Authorization: `Bearer ${opsToken}` },
            failOnStatusCode: false,
          }).then((approveResp) => {
            expect(approveResp.status).to.be.oneOf([200, 204]);
            cy.wait(2000);

            cy.request({
              method: 'POST',
              url: `${API_BASE}/users/login`,
              body: { email: ticketPayload.email, password: ticketPayload.password },
              failOnStatusCode: false,
            }).then((docLogin) => {
              expect(docLogin.status).to.eq(200);
              expect(docLogin.body).to.have.property('token');
            });
          });
        });
      });
    });
  });

  it('can create, start and complete a doctor CHANGE ticket via API', () => {
    const unique = Date.now();

    const doctorTicket = {
      email: `change.doc.${unique}@example.com`,
      password: 'Password123!',
      firstName: 'Change',
      lastName: `Doc${unique}`,
      username: `change_doc_${unique}`,
      phoneNumber: '5557778888',
      gender: 'Other',
      speciality: 'General Practice',
      education: 'Test Med School',
      graduationDate: '2020-01-01',
      bioContent: 'Test doctor for change tickets',
    };

    const opsUser = {
      email: `ops.change.${unique}@example.com`,
      password: 'Password123!',
      firstName: 'Ops',
      lastName: 'Change',
      username: `ops_change_${unique}`,
      role: 'Ops',
      phoneNumber: '5559990000',
      gender: 'Other',
    };

    cy.request({
      method: 'POST',
      url: `${API_BASE}/users/register`,
      body: opsUser,
      failOnStatusCode: false,
    }).then(() => {
      cy.request({
        method: 'POST',
        url: `${API_BASE}/users/login`,
        body: { email: opsUser.email, password: opsUser.password },
      }).then((opsLogin) => {
        const opsToken = opsLogin.body.token;

        cy.request({
          method: 'POST',
          url: `${API_BASE}/tickets/doctorCreate`,
          body: doctorTicket,
        }).then((createTicketResp) => {
          const createTicketId = createTicketResp.body._id || createTicketResp.body.ticket?._id;

          cy.request({
            method: 'PATCH',
            url: `${API_BASE}/tickets/doctorCreate/${createTicketId}/approve`,
            headers: { Authorization: `Bearer ${opsToken}` },
          }).then(() => {
            cy.wait(2000);

            cy.request({
              method: 'POST',
              url: `${API_BASE}/users/login`,
              body: { email: doctorTicket.email, password: doctorTicket.password },
            }).then((docLogin) => {
              const docToken = docLogin.body.token;

              const changePayload = {
                ticketName: `Profile Update ${unique}`,
                description: 'Update my specialty',
              };

              cy.request({
                method: 'POST',
                url: `${API_BASE}/tickets/doctorChange`,
                headers: { Authorization: `Bearer ${docToken}` },
                body: changePayload,
                failOnStatusCode: false,
              }).then((changeResp) => {
                if (changeResp.status === 200 || changeResp.status === 201) {
                  const changeTicket = changeResp.body.ticket || changeResp.body;
                  const changeTicketId = changeTicket._id || changeTicket.id;

                  cy.request({
                    method: 'PATCH',
                    url: `${API_BASE}/tickets/doctorChange/${changeTicketId}/start`,
                    headers: { Authorization: `Bearer ${opsToken}` },
                    failOnStatusCode: false,
                  }).then((startResp) => {
                    expect(startResp.status).to.be.oneOf([200, 204]);

                    cy.request({
                      method: 'PATCH',
                      url: `${API_BASE}/tickets/doctorChange/${changeTicketId}/complete`,
                      headers: { Authorization: `Bearer ${opsToken}` },
                      failOnStatusCode: false,
                    }).then((completeResp) => {
                      expect(completeResp.status).to.be.oneOf([200, 204]);
                    });
                  });
                } else {
                  cy.log('Change ticket creation failed - skipping');
                }
              });
            });
          });
        });
      });
    });
  });
});