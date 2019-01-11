import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {Page} from "../shared/models/page";
import {Employee} from "./employee";

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private BASE_URL = environment.baseUrl;

  // Employee URLs
  private ALL_EMPLOYEES_URL = `${this.BASE_URL}/employees`;
  private EMPLOYEE_CREATE_URL = `${this.BASE_URL}/employees`;
  private EMPLOYEE_URL = `${this.BASE_URL}/employees/`;

  constructor(private http: HttpClient) {
  }

  getEmployees(params: HttpParams): Observable<Page> {
    return this.http.get<Page>(this.ALL_EMPLOYEES_URL, {params});
  }

  createEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.EMPLOYEE_CREATE_URL, employee);
  }

  getEmployeeByEmployeeId(employeeId: number): Observable<Employee> {
    return this.http.get<Employee>(this.EMPLOYEE_URL + employeeId);
  }

  updateEmployee(updateEmployee: Employee): Observable<Employee> {
    return this.http.put<Employee>(this.EMPLOYEE_URL + updateEmployee.id, updateEmployee);
  }

  deleteEmployee(employeeId:number):Observable<Employee>{
    return this.http.delete<Employee>(this.EMPLOYEE_URL+employeeId);
  }

}
