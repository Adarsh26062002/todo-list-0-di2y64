// ***********************************************
// This file contains custom Cypress commands that
// extend Cypress functionality for testing the 
// Todo List application.
// ***********************************************

// cypress is automatically available in Cypress test files
// no explicit import required

/**
 * Creates a new todo item with the provided text
 * @param {string} text - The text for the new todo
 * @example cy.createTodo('Buy groceries')
 */
Cypress.Commands.add('createTodo', (text) => {
  return cy
    .get('.new-todo')
    .type(text)
    .type('{enter}');
});

/**
 * Toggles the completion status of a todo item by its text content
 * @param {string} text - The text of the todo to toggle
 * @example cy.toggleTodo('Buy groceries')
 */
Cypress.Commands.add('toggleTodo', (text) => {
  return cy
    .contains('.todo-list li', text)
    .find('.toggle')
    .click();
});

/**
 * Edits an existing todo item by replacing its text
 * @param {string} currentText - The current text of the todo
 * @param {string} newText - The new text for the todo
 * @example cy.editTodo('Buy groceries', 'Buy organic groceries')
 */
Cypress.Commands.add('editTodo', (currentText, newText) => {
  return cy
    .contains('.todo-list li', currentText)
    .find('label')
    .dblclick()
    .get('.todo-list li.editing .edit')
    .clear()
    .type(newText)
    .type('{enter}');
});

/**
 * Deletes a todo item by its text content
 * @param {string} text - The text of the todo to delete
 * @example cy.deleteTodo('Buy groceries')
 */
Cypress.Commands.add('deleteTodo', (text) => {
  return cy
    .contains('.todo-list li', text)
    .find('.destroy')
    .invoke('show') // The destroy button is only visible on hover
    .click();
});

/**
 * Selects a filter option (All, Active, or Completed)
 * @param {string} filter - The filter to select ('All', 'Active', or 'Completed')
 * @example cy.selectFilter('Active')
 */
Cypress.Commands.add('selectFilter', (filter) => {
  return cy
    .get('.filters')
    .contains(filter)
    .click();
});

/**
 * Verifies that a todo with the specified text exists in the list
 * @param {string} text - The text of the todo to verify
 * @example cy.verifyTodoExists('Buy groceries')
 */
Cypress.Commands.add('verifyTodoExists', (text) => {
  return cy
    .get('.todo-list')
    .should('contain', text);
});

/**
 * Verifies that a todo with the specified text is marked as completed or not
 * @param {string} text - The text of the todo to verify
 * @param {boolean} isCompleted - True if the todo should be completed, false otherwise
 * @example cy.verifyTodoCompleted('Buy groceries', true)
 */
Cypress.Commands.add('verifyTodoCompleted', (text, isCompleted = true) => {
  if (isCompleted) {
    return cy
      .contains('.todo-list li', text)
      .should('have.class', 'completed');
  } else {
    return cy
      .contains('.todo-list li', text)
      .should('not.have.class', 'completed');
  }
});

/**
 * Verifies the count of remaining active todo items
 * @param {number} count - The expected count of active todos
 * @example cy.verifyTodoCount(2)
 */
Cypress.Commands.add('verifyTodoCount', (count) => {
  const itemText = count === 1 ? 'item' : 'items';
  return cy
    .get('.todo-count')
    .should('contain', `${count} ${itemText} left`);
});

/**
 * Clears the localStorage to reset the application state between tests
 * @example cy.clearLocalStorage()
 */
Cypress.Commands.add('clearLocalStorage', () => {
  return cy
    .clearLocalStorage()
    .reload();
});