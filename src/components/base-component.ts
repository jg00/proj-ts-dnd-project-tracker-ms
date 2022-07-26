// namespace App {

// __ V Component Base Abstract Class - indicates should never be instantiated
/*
  Purpose is to abstract general rendering.
  Also placeholder for methods for attaching to the DOM and configuration (adding listener function)
*/
export default abstract class Component<
  T extends HTMLElement,
  U extends HTMLElement
> {
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

// }
