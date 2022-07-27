/*
/// <reference path="base-component.ts" />
/// <reference path="../decorators/autobind.ts"/>
/// <reference path="../util/validation.ts"/>
/// <reference path="../state/project-state.ts"/>
*/

import Component from "./base-component"; // Import a default export
import * as Validation from "../util/validation"; // Grouping
import { autoBind as Autobind } from "../decorators/autobind"; // Alias
import { projectState } from "../state/project-state";

// namespace App {

// __ I ProjectInput Class - responsible for rendering the form, gathering/validating input
export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");

    // Form input
    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;

    // Set up events
    this.configure(); // Note: here 'this' is in the context of our class instance which is the context of configure method.
  }

  // note: these are the implementation of a protected method
  configure() {
    // console.log("ProjectInput outside of the addEventListener", this);
    // this.element.addEventListener("submit", this.submitHandler.bind(this)); // Note that here we bind this.submitHandler method to the event listener
    // Alternative to .bind(this) is to use decorator.
    this.element.addEventListener("submit", this.submitHandler);
  }

  // note: no implementation for this abstract method needed for this class
  renderContent() {}

  // __ 3 Gather user input with tuple return type
  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    // __ 4b More reusable validate input approach
    const titleValdatable: Validation.Validatable = {
      value: enteredTitle,
      required: true,
    };
    const descriptionValidatable: Validation.Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 4,
    };
    const peopleValidatable: Validation.Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 5,
    };

    if (
      !Validation.validate(titleValdatable) ||
      !Validation.validate(descriptionValidatable) ||
      !Validation.validate(peopleValidatable)
    ) {
      alert("Invalid input, please try again!");
      return;
    } else {
      return [enteredTitle, enteredDescription, +enteredPeople];
    }
  }

  // Clear inputs
  private clearInputs() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }

  // __ 2 Set up decorator
  @Autobind
  private submitHandler(e: Event) {
    e.preventDefault();
    // console.log(this.titleInputElement.value); // Note 'this' references the object on which the event listener is attached to ie the currentTarget of the event ie the Form. Therefore 'this' does not point to the class but will need to bind.

    const userInput = this.gatherUserInput(); // Note return undefined or a tuple.  A tuple is an array.
    if (Array.isArray(userInput)) {
      const [title, description, people] = userInput;
      projectState.addProject(title, description, people); // projectState singleton
      this.clearInputs();
    }
  }
}

// }
