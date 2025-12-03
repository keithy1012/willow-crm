/* Messaging & WebSocket tests */
describe('Messaging & WebSockets', () => {
  const API_BASE = Cypress.env('API_BASE') || 'http://localhost:5050/api';
  const WS_URL = Cypress.env('WS_URL') || 'ws://localhost:5050/ws';

  function registerAndLogin(user) {
    return cy.request({ 
      method: 'POST', 
      url: `${API_BASE}/users/register`, 
      body: user, 
      failOnStatusCode: false 
    }).then((regResp) => {
      // Log registration response to debug
      cy.log('Registration response:', regResp.status, regResp.body);
      
      return cy.request({ 
        method: 'POST', 
        url: `${API_BASE}/users/login`, 
        body: { email: user.email, password: user.password },
        failOnStatusCode: false
      });
    });
  }

  function authWebSocket(token) {
    return cy.then(() => {
      return new Cypress.Promise((resolve, reject) => {
        const ws = new WebSocket(WS_URL);
        const messages = [];
        let authenticated = false;

        ws.addEventListener('open', () => {
          ws.send(JSON.stringify({ type: 'auth', token }));
        });

        ws.addEventListener('message', (ev) => {
          try {
            const msg = JSON.parse(ev.data.toString());
            messages.push(msg);

            if (msg.type === 'auth-success') {
              authenticated = true;
              resolve({ ws, messages });
            }

            if (msg.type === 'auth-error') {
              reject(new Error('Auth error: ' + msg.error));
            }
          } catch (err) {
            // ignore parse errors
          }
        });

        ws.addEventListener('error', (err) => {
          if (!authenticated) reject(err);
        });

        setTimeout(() => {
          if (!authenticated) reject(new Error('WebSocket auth timeout'));
        }, 8000);
      });
    });
  }

  it('connects two users, exchanges a message and persists it', () => {
    const unique = Date.now();
    
    // Add all required fields for user registration
    const userA = { 
      email: `msg.a.${unique}@example.com`, 
      password: 'Password123!', 
      firstName: 'Alice', 
      lastName: 'A', 
      username: `alice_${unique}`, 
      phoneNumber: '5551110001', 
      gender: 'Female',
      role: 'Patient'  // Add role if required
    };
    
    const userB = { 
      email: `msg.b.${unique}@example.com`, 
      password: 'Password123!', 
      firstName: 'Bob', 
      lastName: 'B', 
      username: `bob_${unique}`, 
      phoneNumber: '5551110002', 
      gender: 'Male',
      role: 'Patient'  // Add role if required
    };

    // Register and login both users
    registerAndLogin(userA).then((loginA) => {
      expect(loginA.status).to.eq(200);
      const tokenA = loginA.body.token;
      const userIdA = loginA.body.user?._id || loginA.body.user?.id || loginA.body.id || loginA.body.userId;
      
      cy.log('User A ID:', userIdA);

      registerAndLogin(userB).then((loginB) => {
        expect(loginB.status).to.eq(200);
        const tokenB = loginB.body.token;
        const userIdB = loginB.body.user?._id || loginB.body.user?.id || loginB.body.id || loginB.body.userId;
        
        cy.log('User B ID:', userIdB);

        // Start recipient WS (B) first so they can receive messages
        authWebSocket(tokenB).then(({ ws: wsB, messages: messagesB }) => {
          cy.log('User B WebSocket authenticated');
          
          // then start sender WS (A)
          authWebSocket(tokenA).then(({ ws: wsA, messages: messagesA }) => {
            cy.log('User A WebSocket authenticated');
            
            // Wait for presence broadcast
            const waitForUserStatus = new Cypress.Promise((resolveStatus) => {
              const handler = (ev) => {
                try {
                  const msg = JSON.parse(ev.data.toString());
                  if (msg.type === 'user-status' && msg.userId) {
                    resolveStatus(msg);
                    wsB.removeEventListener('message', handler);
                  }
                } catch (e) {}
              };
              wsB.addEventListener('message', handler);
              setTimeout(() => {
                wsB.removeEventListener('message', handler);
                resolveStatus(null);
              }, 3000);
            });

            cy.wrap(waitForUserStatus).then(() => {
              // Create a conversation from A -> B
              const createConvPromise = new Cypress.Promise((resolveConv) => {
                const handler = (ev) => {
                  try {
                    const msg = JSON.parse(ev.data.toString());
                    if (msg.type === 'conversation-created' && msg.conversation) {
                      resolveConv(msg.conversation);
                      wsA.removeEventListener('message', handler);
                    }
                  } catch (e) {}
                };
                wsA.addEventListener('message', handler);
                wsA.send(JSON.stringify({ type: 'create-conversation', data: { recipientId: userIdB } }));
                setTimeout(() => {
                  wsA.removeEventListener('message', handler);
                  resolveConv(null);
                }, 4000);
              });

              cy.wrap(createConvPromise).then((conversation) => {
                expect(conversation, 'Conversation should be created').to.not.equal(null);
                const conversationId = conversation.id;
                cy.log('Conversation created:', conversationId);

                // Send a message from A to B
                const tempId = `temp-${unique}`;
                const messagePayload = {
                  conversationId,
                  encryptedContent: { ciphertext: 'ciphertext', ephemeralPublicKey: 'epk', nonce: 'nonce' },
                  encryptedContentSender: { ciphertext: 'ciphertext-s', ephemeralPublicKey: 'epk-s', nonce: 'nonce-s' },
                  tempId,
                };

                const waitForSent = new Cypress.Promise((resolveSent) => {
                  const handler = (ev) => {
                    try {
                      const msg = JSON.parse(ev.data.toString());
                      if (msg.type === 'message-sent' && msg.message && msg.message.tempId === tempId) {
                        resolveSent({ senderMsg: msg.message });
                        wsA.removeEventListener('message', handler);
                      }
                    } catch (e) {}
                  };
                  wsA.addEventListener('message', handler);
                  wsA.send(JSON.stringify({ type: 'send-message', data: messagePayload }));
                  setTimeout(() => {
                    wsA.removeEventListener('message', handler);
                    resolveSent(null);
                  }, 4000);
                });

                const waitForRecipient = new Cypress.Promise((resolveRec) => {
                  const handler = (ev) => {
                    try {
                      const msg = JSON.parse(ev.data.toString());
                      if (msg.type === 'new-message' && msg.message && msg.message.tempId === tempId) {
                        resolveRec({ recMsg: msg.message });
                        wsB.removeEventListener('message', handler);
                      }
                    } catch (e) {}
                  };
                  wsB.addEventListener('message', handler);
                  setTimeout(() => {
                    wsB.removeEventListener('message', handler);
                    resolveRec(null);
                  }, 4000);
                });

                cy.wrap(Promise.all([waitForSent, waitForRecipient])).then((results) => {
                  const [sentRes, recRes] = results;
                  expect(sentRes, 'Message should be sent').to.not.equal(null);
                  expect(recRes, 'Message should be received').to.not.equal(null);
                  const messageId = sentRes.senderMsg.id;
                  cy.log('Message sent and received:', messageId);

                  // Now request messages-history from wsB to validate persistence
                  const waitForHistory = new Cypress.Promise((resolveHist) => {
                    const handler = (ev) => {
                      try {
                        const msg = JSON.parse(ev.data.toString());
                        if (msg.type === 'messages-history' && Array.isArray(msg.messages)) {
                          resolveHist(msg.messages);
                          wsB.removeEventListener('message', handler);
                        }
                      } catch (e) {}
                    };
                    wsB.addEventListener('message', handler);
                    wsB.send(JSON.stringify({ type: 'get-messages', data: { conversationId } }));
                    setTimeout(() => {
                      wsB.removeEventListener('message', handler);
                      resolveHist([]);
                    }, 4000);
                  });

                  cy.wrap(waitForHistory).then((messages) => {
                    cy.log('Retrieved message history:', messages.length);
                    const found = messages.find((m) => m.id === messageId);
                    expect(found, 'Message should be in history').to.exist;
                    expect(found.encryptedContent).to.have.property('ciphertext');
                    
                    // Clean up WebSocket connections
                    wsA.close();
                    wsB.close();
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});