import { Project, ProjectStatus } from "../models/project";

// namespace App {

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
export const projectState = ProjectState.getInstance(); // Guaranteed to always only have one instance of this object

// console.log("RUNNING.."); // will only run one time even though we are importing projectState more than one time from other files

/* Note: When does this line run?
  - This projectState is imported in other files multiple times but
  it runs once the file is imported for the very first time by another file.
  If another file then imports that same file again it does not run again.
*/

// }
