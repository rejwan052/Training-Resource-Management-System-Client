import {Address} from "../../shared/models/address";
import {Designation} from "../../designations/designation";
import {Department} from "../../departments/department";

export class Employee {

  public id: number;
  public email: string;
  public firstName: string;
  public lastName: string;
  public gender: string;
  public dateOfBirth: string;
  public designation: Designation;
  public department: Department;
  public address:Address;

  constructor(id?: number, email?: string, firstName?: string, lastName?: string, gender?: string,designation?: Designation, department?: Department, dateOfBirth?: string, address?: Address) {
    this.id = id;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.gender = gender;
    this.dateOfBirth = dateOfBirth;
    this.designation = designation;
    this.department = department;
    this.address = address;
  }

}
