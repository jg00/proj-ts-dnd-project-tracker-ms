/*
// __ app.ts dependencies
/// <reference path="./components/project-input.ts"/>
/// <reference path="./components/project-list.ts"/>
*/

/* __ Xa Namespaces only exist in TS.
  Important: there is no equivalent of namespaces in Javascript.
  So with TS it understands where to find imported class, interfaces, other types, etc.
  However once compiled to JS however JS does not know of the reference connections we indicated to TS.
  So for example once TS completes compilation JS does not know how to find a Project class to instantiate.

  Solution: We have to make sure we carry over these connections/references.
  In the tsconfig.json we uncomment the "outFile": "./" and the idea behind outFile is
  we tell TS that it should concatenate references during compilation into one single JS file instead of
  compiling multiple JS files.

  Also need to change "module": "commonjs" to "adm" to make above work
*/

/* __ XI Namespaces (is a TS feature only) vs ES6 Modules
  Important: Clear advantage is we 'clearly' state what we need for each file
  via import statement.  If we omit an import that is needed TS will let indicate
  issue.

  Also note before webpack at this point all our files will require multiple
  network requests for every import.
*/
import { ProjectInput } from "./components/project-input.js";
import { ProjectList } from "./components/project-list.js";

// namespace App {

new ProjectInput();
new ProjectList("active");
new ProjectList("finished");

// const prjInput = new ProjectInput();
// const activePrjList = new ProjectList("active");
// const finishedPrjList = new ProjectList("finished");

// }

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
