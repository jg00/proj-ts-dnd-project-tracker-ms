// __ IXa Drag & Drop Interfaces - purpose is to force a class to implement everything it needs to either be draggable or be a valid drop target
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
}

// __ IVb People Enum Types
enum ProjectStatus {
  Active,
  Finished,
}

// __ IVa Project Type
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

// __ IVc Define Listener Function - Converted to a generic type to make flexible to receive Project type, etc.
type Listener<T> = (items: T[]) => void;

// __ VI State - Base class - Generic class now allow us to create derived classes that hold different state values ex: cart state, project state, etc.
class State<T> {
  // __ 6c For Subscription pattern
  protected listeners: Listener<T>[] = []; // Array of functions. Idea is whenever state changes we call all listener functions.

  // Keep track of listeners.  Note these functions will need to be a function that has the projects state argument
  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

// __ III Project State Management Class - Singleton Pattern, Subscription Pattern
/*
  Singleton Pattern: Idea is to build a class that will 1. manage the state of our application 
  which 2. also allow us to then set up listeners in the different parts of the app that
  are interested in data state changes.

  Questions:
  1 How do we call addProject from inside ProjectInput Class private submitHandler method?
  2 How do we then pass the updated list to ProjectList Class whenever the projects list updates?
  Solution:
  - Create a global singleton instance of ProjectState to access addProject method
  - We need to set up a subscription pattern where inside of our ProjectState we manage a list of
    listeners (ie a list of functions in the end) which should be called whenever something changes.
*/
class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  // __ 6b Make private to guarantee this is a singleton class and we cannot instantiate from outside except via getInstance().
  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  /* __ How do we now update state and let subscribers know about state changes?
  How do we call addProject from inside ProjectInput Class private submitHandler method?
  How do we then pass the updated list to ProjectList Class whenever the projects list updates?
  Solution:
  - Create a global singleton instance of ProjectState to access addProject.
  */
  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numOfPeople,
      ProjectStatus.Active
    );

    this.projects.push(newProject);
    this.updateListeners();
    // for (const listenerFn of this.listeners) {
    //   listenerFn(this.projects.slice()); // Pass in copy of the state so it cannot be edited from the place it is coming from.
    // }
  }

  // __ IXe Drag and Drop changes project status - need to know which project to move and to where to move it to
  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find((project) => project.id === projectId);
    if (project && project.status !== newStatus) {
      project.status = newStatus; // ProjectStatus.Active or ProjectStatus.Finished
      this.updateListeners();
    }
  }

  // __ Run all listener functions so subscribers will get latest state changes
  private updateListeners() {
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice()); // Pass in copy of the state so it cannot be edited from the place it is coming from.
    }
  }
}

// __ 6a Set up global state instance and initialize - Singleton
// const projectState = new ProjectState(); // Cannot instantiate directly b/c of private constructor
const projectState = ProjectState.getInstance(); // Guaranteed to always only have one instance of this object

// __ 4a Validation
/* Using a type is an option but normally if defining an object an interface is 
also a good approach. We could also have used a class an instantiated.
*/
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number; // for length of string
  maxLength?: number;
  min?: number; // for actual number of people
  max?: number;
}

function validate(validatableInput: Validatable): boolean {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }
  // != null includes null and undefined but we want to still check if minLength set to zero (ie falsy value).
  if (
    validatableInput.minLength != null &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid && validatableInput.value.length >= validatableInput.minLength;
  }

  if (
    validatableInput.maxLength != null &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid && validatableInput.value.length <= validatableInput.maxLength;
  }

  if (
    validatableInput.min != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }
  if (
    validatableInput.max != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }

  return isValid;
}

// __ 2 autoBind Decorator - add to submitHandler
function autoBind(
  _target: any,
  _methodName: string,
  descriptor: PropertyDescriptor
) {
  /*
  console.log(target);
  console.log(methodName);
  console.log(descriptor.value); // submitHandler()
  */

  const originalMethod = descriptor.value;
  const adjustedDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this); // Note 'this' references the instantiated class where the method is defined
      return boundFn;
    },
  };

  return adjustedDescriptor;
}

// __ V Component Base Abstract Class - indicates should never be instantiated
/*
  Purpose is to abstract general rendering.
  Also placeholder for methods for attaching to the DOM and configuration (adding listener function)
*/
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string
  ) {
    this.templateElement = document.getElementById(
      templateId
    ) as HTMLTemplateElement;

    this.hostElement = document.getElementById(hostElementId) as T;

    const importedNode: DocumentFragment = document.importNode(
      this.templateElement.content, // ex: <section class="projects">..</section>
      true
    );

    // First child element of the <template id=templateId> = this.element
    this.element = importedNode.firstElementChild as U; // We cannot attach DocumentFragment. Important - this.element is now the concrete property that points at the node that we want to insert.

    if (newElementId) {
      this.element.id = newElementId; // 'active-projects' or 'finished-projects' or 'user-input', etc
    }

    this.attach(insertAtStart);
  }

  private attach(insertAtBeginning: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtBeginning ? "afterbegin" : "beforeend",
      this.element
    );
  }

  // Derived classes should provide implementation for these in case these derived classes may rely on some set up that are available only after the base class constructor completes first.
  protected abstract configure(): void; // note: private abstract not allowed. configure() for handling adding event listener functions within derived classes, adding event listeners for forms, etc.
  protected abstract renderContent(): void; // note: container additional configuration added if needed.
}

// __ VII ProjectItem Class - responsible for rendering a single project item. To it's constructor pass in hostId (ie either the active-persons-list or finished-persons-list ul list) and pass in the data (ie project instance).
// __ IXb Implement drag & drop
class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  private project: Project;

  // __ VIII Getter
  get persons() {
    if (this.project.people === 1) {
      return `1 person`;
    } else {
      return `${this.project.people} persons`;
    }
  }

  // hostId would either be the active projects list or the finished projects list
  constructor(hostId: string, project: Project) {
    // console.log(hostId); // One of the <ul id="active-projects-list" or "finished-projects-list">
    super("single-project", hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  // __ IXb Draggable Handlers
  @autoBind
  dragStartHandler(event: DragEvent): void {
    console.log("step 1: dragStart", event.dataTransfer!.getData("text/plain"));
    event.dataTransfer!.setData("text/plain", this.project.id);
    event.dataTransfer!.effectAllowed = "move"; // note: Tell browser of our intention ex: move or copy.
  }

  dragEndHandler(_event: DragEvent): void {
    // event.preventDefault()
    console.log("DragEnd"); // Will not do anything specific in this function
  }

  configure() {
    // __ Listen for drag events
    this.element.addEventListener("dragstart", this.dragStartHandler);
    this.element.addEventListener("dragend", this.dragEndHandler);
  }

  // note: here this.element is our <li> element parent in the <template id="single-project">
  renderContent() {
    this.element.setAttribute("draggable", "true");
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector("h3")!.textContent = `${this.persons} assigned`;
    this.element.querySelector("p")!.textContent = this.project.description;
  }
}

// __ II ProjectList Class - note when we create instance of ProjectList it will always be provided either 'active' or 'relative
class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignedProjects: Project[];

  // Note here we intentionally used the string literal types instead of enum b/c we need to use them when setting the element id below.
  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);

    this.assignedProjects = []; // initialize

    this.configure();
    this.renderContent();
  }

  // __ IXc DragTarget Handlers - note behavior - dragover event seems to also fire when the draggable element itself is first dragged over itself
  @autoBind
  dragOverHandler(event: DragEvent): void {
    console.log("step 2: dragover", event.dataTransfer!.getData("text/plain"));

    // __ Check if a drag/drop is really allowed here and is the data attached to our dataTransfer of 'text/plain' format? This means we would not allow dropping images for example.
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      /* __ IMPORTANT - why we preventDefault on the drag over event handler.
        'drop' event will only trigger on an element if in the drag over handler on that same 
        element you call event.preventDefault().  The default is not to allow dropping on an element 
        you are over. So you have to prevent the default in the drag over handler to tell the browser 
        that for this element (ie this <ul>) you want to allow a drop.

        So now the 'drop' event will fire when the user lets go otherwise the 'drop' event will not fire.
      */
      event.preventDefault();

      // this.element is the <section> and not the <ul>
      const listEl = this.element.querySelector("ul")!;
      listEl.classList.add("droppable");
    }
  }

  @autoBind
  dropHandler(event: DragEvent): void {
    console.log("step 3: drop", event.dataTransfer!.getData("text/plain"));
    event.preventDefault(); // For Firefox

    // __ IXd Goal now is to change the project status
    const prjId = event.dataTransfer!.getData("text/plain");

    projectState.moveProject(
      prjId,
      this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
    );
  }

  @autoBind
  dragLeaveHandler(_event: DragEvent): void {
    const listEl = this.element.querySelector("ul")!;
    listEl.classList.remove("droppable");
  }

  // note: these are the implementation of a protected method
  // __ Configure - Here we provide a listener function to the projectState to listen for state changes.
  configure() {
    // __ Listen for drag events
    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHandler);
    this.element.addEventListener("drop", this.dropHandler);

    // __ Register a listener function. We get list of projects from our ProjectState singleton instance.
    projectState.addListener((projects: Project[]) => {
      // console.log(projects);

      // Filter by state type to render only what we need
      const relevantProjects = projects.filter((project) => {
        if (this.type === "active") {
          return project.status === ProjectStatus.Active;
        }
        return project.status === ProjectStatus.Finished;
      });

      this.assignedProjects = relevantProjects; // we overwrite the assignedProjects for every update to the list of projects
      this.renderProjects();
    });
  }

  // __ Render projects container that will contain project list
  renderContent() {
    const listId = `${this.type}-projects-list`; // 'active-projects-list' or 'finished-projects-list'
    this.element.querySelector("ul")!.id = listId; // CSS styling based on id
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " PROJECTS";
  }

  // __ Build <li> project item and append to the <ul>
  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    ) as HTMLUListElement; // <ul id="active-projects-list"> and <ul id="finished-projects-list">  will exists b/c renderContent() runs first

    // Note: In this scenario it would be costly to do a DOM comparison to only render a unique list. Instead we just reset the DOM.
    listEl.innerHTML = "";

    // Here this.element is the first element child of <template id="project-list"> which is <section class="projects"> host set on our ProjectList that extends Component that sets the this.element
    // console.log(this.element); // either <section id="active-projects"> or <section id="finished-projects">
    for (const prjItem of this.assignedProjects) {
      new ProjectItem(this.element.querySelector("ul")!.id, prjItem); // .id will either be 'active-projects-list' or 'finished-projects-list'

      /* Before
        const listItem: HTMLLIElement = document.createElement("li");
        listItem.textContent = prjItem.title; // <li>Some Title</li>
        listEl.appendChild(listItem);
      */
    }
  }
}

// __ I ProjectInput Class - responsible for rendering the form, gathering/validating input
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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
    const titleValdatable: Validatable = {
      value: enteredTitle,
      required: true,
    };
    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 4,
    };
    const peopleValidatable: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 5,
    };

    if (
      !validate(titleValdatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
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
  @autoBind
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

const prjInput = new ProjectInput();
const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList("finished");

/* Side Test to get form to render to the DOM
const templateElement1 = document.getElementById(
  "project-input"
)! as HTMLTemplateElement;
const test: DocumentFragment = templateElement1.content;

const hostElement1 = document.getElementById("app")! as HTMLDivElement;
hostElement1.appendChild(test);
*/

/*
project form input:
title, description, number of people

templates:
project-input
single-project
project-list

div on which to render to:
app

*/
