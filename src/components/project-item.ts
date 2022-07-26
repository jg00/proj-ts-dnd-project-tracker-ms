/* For namespace examples only
/// <reference path="base-component.ts"/>
/// <reference path="../decorators/autobind.ts"/>
/// <reference path="../models/project.ts"/>
/// <reference path="../models/drag-drop.ts"/>
*/

import { Draggable } from "../models/drag-drop.js"; // Note .js extension
import { Project } from "../models/project.js";
import Component from "./base-component.js";
import { autoBind } from "../decorators/autobind.js";

// namespace App {
// __ VII ProjectItem Class - responsible for rendering a single project item. To it's constructor pass in hostId (ie either the active-persons-list or finished-persons-list ul list) and pass in the data (ie project instance).
// __ IXb Implement drag & drop
export class ProjectItem
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

// }
