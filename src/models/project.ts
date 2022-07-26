// namespace App {

// __ IVb People Enum Types
export enum ProjectStatus {
  Active,
  Finished,
}

// __ IVa Project Type
export class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

// }
