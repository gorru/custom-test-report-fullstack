import {getCypressTestBed, initEnv, mount} from 'cypress-angular-unit-test';
import {AppComponent} from "../app.component";
import {RouterTestingModule} from "@angular/router/testing";
import {CoursesComponent} from "./courses.component";
import {HttpClient, HttpClientModule} from "@angular/common/http";


describe('CoursesComponent', () => {
  it('shows the input', () => {
    // Init Angular stuff
    initEnv(CoursesComponent, {
      imports: [
          RouterTestingModule,
          HttpClientModule
      ]
    });
    // component + any inputs object
    mount(CoursesComponent);

    // use any Cypress command afterwards
    // @ts-ignore
    cy.contains('All Courses');
  });
});
