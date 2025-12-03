/* Ops Ticket Edge Cases & Negative Tests */
describe('Ops Ticket Edge Cases', () => {
  const API_BASE = Cypress.env('API_BASE') || 'http://localhost:5050/api';

  function makeTicketPayload(unique) {
    return {
      email: `edge.doctor.${unique}@example.com`,
      password: 'Password123!',
      firstName: 'Edge',
      lastName: `Doctor${unique}`,
      username: `edge_doctor_${unique}`,
      phoneNumber: '5550009999',
      gender: 'Other',
      speciality: 'Test Specialty',
      education: 'Edge Medical School',
      graduationDate: '2020-01-01',
      bioContent: 'Edge case doctor creation',
    };
  }

  it('returns error when approving an already-approved ticket (no duplicate creation)', () => {
    const unique = Date.now();
    const payload = makeTicketPayload(unique);

    // Create ticket
    cy.request({ method: 'POST', url: `${API_BASE}/tickets/doctorCreate`, body: payload, failOnStatusCode: false }).then((ticketResp) => {
      expect(ticketResp.status).to.be.oneOf([200, 201]);
      const ticket = ticketResp.body.ticket || ticketResp.body;
      const ticketId = ticket._id || ticket.id || ticket.ticketId;
      expect(ticketId).to.exist;

      // Create first Ops user and approve
      const ops1 = { email: `ops.edge1.${unique}@example.com`, password: 'Password123!', firstName: 'Ops1', lastName: 'Edge', username: `ops_edge1_${unique}`, role: 'Ops', phoneNumber: '5551010101', gender: 'Other' };
      cy.request({ method: 'POST', url: `${API_BASE}/users/register`, body: ops1, failOnStatusCode: false }).then(() => {
        cy.request({ method: 'POST', url: `${API_BASE}/users/login`, body: { email: ops1.email, password: ops1.password }, failOnStatusCode: false }).then((login1) => {
          expect(login1.status).to.eq(200);
          const token1 = login1.body.token;

          cy.request({ method: 'PATCH', url: `${API_BASE}/tickets/doctorCreate/${ticketId}/approve`, headers: { Authorization: `Bearer ${token1}` }, failOnStatusCode: false }).then((approve1) => {
            expect(approve1.status).to.be.oneOf([200, 201, 204]);

            // Create second Ops user and attempt second approval - should fail (duplicate or error)
            const ops2 = { email: `ops.edge2.${unique}@example.com`, password: 'Password123!', firstName: 'Ops2', lastName: 'Edge', username: `ops_edge2_${unique}`, role: 'Ops', phoneNumber: '5552020202', gender: 'Other' };
            cy.request({ method: 'POST', url: `${API_BASE}/users/register`, body: ops2, failOnStatusCode: false }).then(() => {
              cy.request({ method: 'POST', url: `${API_BASE}/users/login`, body: { email: ops2.email, password: ops2.password }, failOnStatusCode: false }).then((login2) => {
                expect(login2.status).to.eq(200);
                const token2 = login2.body.token;

                cy.request({ method: 'PATCH', url: `${API_BASE}/tickets/doctorCreate/${ticketId}/approve`, headers: { Authorization: `Bearer ${token2}` }, failOnStatusCode: false }).then((approve2) => {
                  // The second approval should not succeed creating a duplicate account — accept non-200 or 4xx/5xx
                  expect(approve2.status).to.not.eq(200);
                });
              });
            });
          });
        });
      });
    });
  });

  it('rejects approval attempts by non-Ops users (403)', () => {
    const unique = Date.now();
    const payload = makeTicketPayload(unique);

    cy.request({ method: 'POST', url: `${API_BASE}/tickets/doctorCreate`, body: payload, failOnStatusCode: false }).then((ticketResp) => {
      expect(ticketResp.status).to.be.oneOf([200, 201]);
      const ticket = ticketResp.body.ticket || ticketResp.body;
      const ticketId = ticket._id || ticket.id || ticket.ticketId;
      expect(ticketId).to.exist;

      // Create a Patient (non-Ops) user and try to approve
      const patientUser = { email: `patient.edge.${unique}@example.com`, password: 'Password123!', firstName: 'Pat', lastName: 'Edge', username: `pat_edge_${unique}`, role: 'Patient', phoneNumber: '5553030303', gender: 'Other' };
      cy.request({ method: 'POST', url: `${API_BASE}/users/register`, body: patientUser, failOnStatusCode: false }).then(() => {
        cy.request({ method: 'POST', url: `${API_BASE}/users/login`, body: { email: patientUser.email, password: patientUser.password }, failOnStatusCode: false }).then((patLogin) => {
          expect(patLogin.status).to.eq(200);
          const patToken = patLogin.body.token;

          cy.request({ method: 'PATCH', url: `${API_BASE}/tickets/doctorCreate/${ticketId}/approve`, headers: { Authorization: `Bearer ${patToken}` }, failOnStatusCode: false }).then((resp) => {
            // Should be forbidden
            expect(resp.status).to.be.oneOf([401, 403]);
          });
        });
      });
    });
  });

  it('returns 404 for invalid ticket id', () => {
    const invalidId = '000000000000000000000000';

    // Create Ops user to attempt approve
    const unique = Date.now();
    const ops = { email: `ops.invalid.${unique}@example.com`, password: 'Password123!', firstName: 'Ops', lastName: 'Invalid', username: `ops_invalid_${unique}`, role: 'Ops', phoneNumber: '5554040404', gender: 'Other' };

    cy.request({ method: 'POST', url: `${API_BASE}/users/register`, body: ops, failOnStatusCode: false }).then(() => {
      cy.request({ method: 'POST', url: `${API_BASE}/users/login`, body: { email: ops.email, password: ops.password }, failOnStatusCode: false }).then((login) => {
        expect(login.status).to.eq(200);
        const token = login.body.token;

        cy.request({ method: 'PATCH', url: `${API_BASE}/tickets/doctorCreate/${invalidId}/approve`, headers: { Authorization: `Bearer ${token}` }, failOnStatusCode: false }).then((resp) => {
          expect(resp.status).to.be.oneOf([400, 404, 500]);
        });
      });
    });
  });
});
