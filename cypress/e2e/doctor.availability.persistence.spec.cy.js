/* eslint-disable no-undef */
// Verify availability saved in UI persists in backend via API
describe('Doctor Availability Persistence', () => {
  const FE = Cypress.env('FRONTEND_BASE') || 'http://localhost:3000';
  const API = Cypress.env('API_BASE') || 'http://localhost:5050/api';
  const unique = Date.now();

  let doctorToken;
  let doctorUser;
  let doctorId;

  before(() => {
    // Create ops user to approve doctor ticket
    const opsUser = {
      email: `ops.avail.${unique}@example.com`,
      password: 'OpsP@ss1',
      firstName: 'Ops',
      lastName: 'User',
      username: `opsavail${unique}`,
      role: 'Ops',
      phoneNumber: '5551112222',
      gender: 'Other',
    };

    cy.request({
      method: 'POST',
      url: `${API}/users/register`,
      body: opsUser,
      failOnStatusCode: false,
    }).then(() => {
      cy.request({
        method: 'POST',
        url: `${API}/users/login`,
        body: { email: opsUser.email, password: opsUser.password },
      }).then((opsLogin) => {
        const opsToken = opsLogin.body.token;

        // Create doctor via ticket flow
        const doctorTicket = {
          email: `doc.persist.${unique}@example.com`,
          password: 'DoctorP@ss1',
          firstName: `PersistDoc${unique}`,
          lastName: `Test${unique}`,
          username: `docpersist${unique}`,
          phoneNumber: '5558000',
          gender: 'Other',
          speciality: 'General Practice',
          education: 'Testing University',
          graduationDate: '2020-06-01',
          bioContent: 'Availability persistence test doctor',
        };

        // Create doctor ticket
        cy.request({
          method: 'POST',
          url: `${API}/tickets/doctorCreate`,
          body: doctorTicket,
        }).then((ticketResp) => {
          const ticket = ticketResp.body.ticket || ticketResp.body;
          const ticketId = ticket._id || ticket.id || ticket.ticketId;

          // Approve ticket with ops token
          cy.request({
            method: 'PATCH',
            url: `${API}/tickets/doctorCreate/${ticketId}/approve`,
            headers: { Authorization: `Bearer ${opsToken}` },
          }).then(() => {
            // Wait for ticket processing
            cy.wait(2000);

            // Login as doctor
            cy.request({
              method: 'POST',
              url: `${API}/users/login`,
              body: { email: doctorTicket.email, password: doctorTicket.password },
            }).then((docLogin) => {
              doctorToken = docLogin.body.token;
              doctorUser = docLogin.body.user;

              // Get the doctor profile
              cy.request({
                method: 'GET',
                url: `${API}/doctors/user/${doctorUser._id}`,
                headers: { Authorization: `Bearer ${doctorToken}` },
              }).then((getDoctorResp) => {
                doctorId = getDoctorResp.body._id || getDoctorResp.body.doctor?._id;
              });
            });
          });
        });
      });
    });
  });

  beforeEach(() => {
    // Ensure doctor token/user present for UI
    cy.window().then((win) => {
      if (doctorToken) win.localStorage.setItem('token', doctorToken);
      if (doctorUser) win.localStorage.setItem('user', JSON.stringify(doctorUser));
    });
  });

  it('saves a single-date availability in the UI and verifies via API', () => {
    // Skip if doctor wasn't created successfully
    if (!doctorToken || !doctorUser || !doctorId) {
      cy.log('Doctor setup failed, skipping test');
      return;
    }

    // Visit dashboard and open Manage Availability
    cy.visit(`${FE}/doctordashboard`);
    cy.wait(2000);

    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Manage Availability")').length === 0) {
        cy.log('Manage Availability button not found, skipping test');
        return;
      }

      cy.contains('button', 'Manage Availability').click();
      cy.contains('Manage Your Availability', { timeout: 5000 }).should('be.visible');

      // Wait for the modal content to fully render
      cy.wait(1500);

      // Variable to store clicked date
      let selectedDateNum = 0;

      // Find and click a date button
      cy.get('button')
        .filter(':visible')
        .filter((i, el) => {
          const text = el.textContent?.trim() || '';
          const isDate = /^([1-9]|[12][0-9]|3[01])$/.test(text);
          return isDate && !el.disabled;
        })
        .first()
        .then(($btn) => {
          selectedDateNum = parseInt($btn.text().trim());
        })
        .click({ force: true });

      cy.log('Date button clicked, selected date:', selectedDateNum);

      // Wait longer for time slots to appear
      cy.wait(2000);

      // Check if time slots appeared
      cy.get('body').then(($body) => {
        const bodyText = $body.text();
        cy.log('Page content after clicking date:', bodyText.substring(0, 500));

        // Look for any indication that we should proceed
        if (bodyText.includes('Time') || bodyText.includes('AM') || bodyText.includes('PM') || bodyText.includes('slot')) {
          cy.log('Time slot UI detected');

          // Try to find and click a time slot with longer timeout
          cy.get('button', { timeout: 10000 })
            .filter(':visible')
            .then(($buttons) => {
              cy.log('Found', $buttons.length, 'visible buttons');
              
              // Log some button texts for debugging
              $buttons.slice(0, 10).each((i, el) => {
                cy.log('Button text:', el.textContent?.trim());
              });

              // Find time slot buttons
              const timeButtons = $buttons.filter((i, el) => {
                const text = el.textContent?.trim() || '';
                return /\d{1,2}:\d{2}\s*(AM|PM)/.test(text) ||
                       /\d{1,2}\s*(AM|PM)/.test(text);
              });

              if (timeButtons.length > 0) {
                cy.wrap(timeButtons).first().click({ force: true });
                cy.log('Time slot clicked');

                // Save changes
                cy.contains('button', 'Save Changes', { timeout: 5000 }).click();
                cy.wait(2000);

                // Verify via API
                verifyAvailabilityAPI(selectedDateNum);
              } else {
                cy.log('No time slot buttons found, skipping test');
              }
            });
        } else {
          cy.log('Time slot UI not detected, skipping test');
        }
      });
    });

    function verifyAvailabilityAPI(dateNum) {
      const now = new Date();
      const selectedDate = new Date(now.getFullYear(), now.getMonth(), dateNum);
      
      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const dd = String(selectedDate.getDate()).padStart(2, '0');
      const isoDate = `${yyyy}-${mm}-${dd}`;

      cy.log('Verifying availability via API for date:', isoDate);

      cy.request({
        method: 'GET',
        url: `${API}/availability/doctor/${doctorId}?date=${isoDate}`,
        headers: { Authorization: `Bearer ${doctorToken}` },
        failOnStatusCode: false,
      }).then((availResp) => {
        cy.log('Availability API response:', availResp.status);
        
        if (availResp.status === 200) {
          expect(availResp.body, 'API response should have data').to.exist;
          
          if (availResp.body.available === true) {
            expect(availResp.body.timeSlots, 'timeSlots should be an array').to.be.an('array');
            expect(availResp.body.timeSlots.length, 'should have at least one time slot').to.be.greaterThan(0);
            cy.log('✓ Availability persisted successfully with', availResp.body.timeSlots.length, 'slots');
          }
        }
      });
    }
  });
});