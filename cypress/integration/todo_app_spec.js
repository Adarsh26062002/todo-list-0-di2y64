// End-to-end tests for the Todo List application
// Using Cypress v10.0.0+

describe('Todo Application', () => {
  // Setup before each test
  beforeEach(() => {
    // Clear localStorage to ensure test isolation
    cy.clearLocalStorage();
    // Visit the application
    cy.visit('/');
  });

  it('allows creating, completing, and filtering todos', () => {
    // Create todos
    cy.get('.new-todo').type('First todo{enter}');
    cy.get('.new-todo').type('Second todo{enter}');
    
    // Verify todos were created
    cy.get('.todo-list li').should('have.length', 2);
    cy.get('.todo-list li').first().should('contain', 'First todo');
    cy.get('.todo-list li').last().should('contain', 'Second todo');
    
    // Complete first todo
    cy.get('.todo-list li').first().find('.toggle').click();
    
    // Verify completed styling
    cy.get('.todo-list li').first().should('have.class', 'completed');
    
    // Filter to show only active todos
    cy.get('.filters').contains('Active').click();
    
    // Verify only active todos are shown
    cy.get('.todo-list li').should('have.length', 1);
    cy.get('.todo-list li').should('contain', 'Second todo');
    
    // Filter to show only completed todos
    cy.get('.filters').contains('Completed').click();
    
    // Verify only completed todos are shown
    cy.get('.todo-list li').should('have.length', 1);
    cy.get('.todo-list li').should('contain', 'First todo');
    
    // Test persistence by reloading the page
    cy.reload();
    
    // Verify todos persisted
    cy.get('.todo-list li').should('have.length', 1);
    cy.get('.todo-list li').should('contain', 'First todo');
    cy.get('.todo-list li').should('have.class', 'completed');
    
    // Verify filter selection persisted
    cy.get('.filters a.selected').should('contain', 'Completed');
  });

  it('allows editing existing todos', () => {
    // Create a todo
    cy.get('.new-todo').type('Todo to edit{enter}');
    
    // Verify todo was created
    cy.get('.todo-list li').should('have.length', 1);
    cy.get('.todo-list li').first().should('contain', 'Todo to edit');
    
    // Double-click to enter edit mode
    cy.get('.todo-list li label').first().dblclick();
    
    // Verify edit mode is active
    cy.get('.todo-list li.editing').should('exist');
    cy.get('.editing .edit').should('exist');
    
    // Clear the current text and type new text
    cy.get('.editing .edit').clear().type('Edited todo{enter}');
    
    // Verify todo was updated
    cy.get('.todo-list li').should('have.length', 1);
    cy.get('.todo-list li').first().should('contain', 'Edited todo');
    
    // Ensure we're not in edit mode anymore
    cy.get('.todo-list li.editing').should('not.exist');
  });

  it('allows deleting todos', () => {
    // Create multiple todos
    cy.get('.new-todo').type('First todo{enter}');
    cy.get('.new-todo').type('Second todo{enter}');
    cy.get('.new-todo').type('Third todo{enter}');
    
    // Verify todos were created
    cy.get('.todo-list li').should('have.length', 3);
    
    // Get initial todo count
    cy.get('.todo-count strong').invoke('text').then((countText) => {
      const initialCount = parseInt(countText);
      
      // Delete the second todo (using force because the button might only be visible on hover)
      cy.get('.todo-list li').eq(1).find('.destroy').click({force: true});
      
      // Verify todo was removed
      cy.get('.todo-list li').should('have.length', 2);
      cy.get('.todo-list li').eq(0).should('contain', 'First todo');
      cy.get('.todo-list li').eq(1).should('contain', 'Third todo');
      
      // Verify count was updated
      cy.get('.todo-count strong').should('contain', initialCount - 1);
    });
  });

  it('validates todo input', () => {
    // Try to submit empty todo
    cy.get('.new-todo').type('{enter}');
    
    // Verify validation error message
    cy.get('.error-message').should('be.visible');
    cy.get('.error-message').should('contain', 'Todo text cannot be empty');
    
    // Try to submit whitespace-only todo
    cy.get('.new-todo').clear().type('    {enter}');
    
    // Verify validation error message
    cy.get('.error-message').should('be.visible');
    cy.get('.error-message').should('contain', 'Todo text cannot be only whitespace');
    
    // Submit valid todo
    cy.get('.new-todo').clear().type('Valid todo{enter}');
    
    // Verify todo was added and error message is gone
    cy.get('.todo-list li').should('have.length', 1);
    cy.get('.todo-list li').should('contain', 'Valid todo');
    cy.get('.error-message').should('not.exist');
  });
});