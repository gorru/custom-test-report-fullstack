import {initEnv, mount} from 'cypress-angular-unit-test';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('shows the input', () => {
    // Init Angular stuff
    initEnv(AppComponent);
    // component + any inputs object
    mount(AppComponent, {title: 'World'});
    // use any Cypress command afterwards
    cy.contains('Welcome to World!');
  });
});
