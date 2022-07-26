/*
/// <reference path="base-component.ts"/>
/// <reference path="../decorators/autobind.ts"/>
/// <reference path="../models/project.ts"/>
/// <reference path="../models/drag-drop.ts"/>
*/

import { DragTarget } from "../models/drag-drop.js";
import { Project, ProjectStatus } from "../models/project.js";
import Component from "./base-component.js";
import { autoBind } from "../decorators/autobind.js";
import { projectState } from "../state/project-state.js";
import { ProjectItem } from "./project-item.js";

// namespace App {

// __ II ProjectList Class - note when we create instance of ProjectList it will always be provided either 'active' or 'relative
export class ProjectList
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

// }
