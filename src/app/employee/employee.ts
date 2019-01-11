import {Address} from "../shared/models/address";

export class Employee{

  public id: number;
  public email: string;
  public firstName: string;
  public lastName: string;
  public gender: string;
  public dateOfBirth: Date = new Date();
  public designationId: number;
  public departmentId: number;
  public address:Address;

  constructor(id?: number, email?: string, firstName?: string, lastName?: string,
              gender?: string, dateOfBirth?: Date, designationId?: number,
              departmentId?: number,address?:Address) {
    this.id = id;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.gender = gender;
    this.dateOfBirth = dateOfBirth;
    this.designationId = designationId;
    this.departmentId = departmentId;
    this.address = address;
  }

}
