// Custom Cypress helper commands for the test suite.
const API_BASE = Cypress.env('API_BASE') || 'http://localhost:5050/api';
const FE_BASE = Cypress.env('FRONTEND_BASE') || 'http://localhost:3000';

// Register a user via the backend API. Returns the full response.
Cypress.Commands.add('apiRegister', (user) => {
	return cy.request({
		method: 'POST',
		url: `${API_BASE}/users/register`,
		body: user,
		failOnStatusCode: false,
	});
});

// Login via API and persist token + user to localStorage in the browser.
Cypress.Commands.add('apiLogin', (email, password) => {
	return cy.request({
		method: 'POST',
		url: `${API_BASE}/users/login`,
		body: { email, password },
		failOnStatusCode: false,
	}).then((resp) => {
		if (resp.status === 200 && resp.body.token) {
			// Return the cy.window() chain to properly handle async operations
			return cy.window().then((win) => {
				win.localStorage.setItem('token', resp.body.token);
				win.localStorage.setItem('user', JSON.stringify(resp.body.user));
				return resp;
			});
		}
		return resp;
	});
});

// UI login (fills the login form and submits)
Cypress.Commands.add('loginUI', (email, password) => {
	const url = `${FE_BASE}/login`;
	cy.visit(url);
	cy.contains('label', 'Email').next().find('input').clear().type(email);
	cy.contains('label', 'Password').next().find('input').clear().type(password);
	cy.contains('button', 'Login').click();
});

// Utility to register and login via API in one go (returns login resp)
Cypress.Commands.add('createAndLogin', (user) => {
	return cy.apiRegister(user).then((reg) => {
		// If register returned token, persist to localStorage and return the response.
		if (reg.status === 201 && reg.body.token) {
			// Return the cy chain so we don't mix sync return with cy commands
			return cy.window().then((win) => {
				win.localStorage.setItem('token', reg.body.token);
				win.localStorage.setItem('user', JSON.stringify(reg.body.user));
				return reg;
			});
		}

		// Otherwise, attempt login and return that chain
		return cy.apiLogin(user.email, user.password);
	});
});

// Create a patient (user + patient record) via API
Cypress.Commands.add('createPatientAccount', (patient) => {
	return cy.request({
		method: 'POST',
		url: `${API_BASE}/patients`,
		body: patient,
		failOnStatusCode: false,
	});
});