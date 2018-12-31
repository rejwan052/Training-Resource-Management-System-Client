import {Designation} from "../designations/designation";
import {Department} from "../departments/department";

export class Employee {
  public id: number;
  public firstName: string;
  public lastName: string;
  public dateOfBirth: Date = new Date();
  public designation: Designation;
  public department: Department;

  constructor(id?: number, firstName?: string, lastName?: string, dateOfBirth?: Date, designation?: Designation, department?: Department) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.dateOfBirth = dateOfBirth;
    this.designation = designation;
    this.department = department;
  }
}
