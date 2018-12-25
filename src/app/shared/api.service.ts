import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Department } from '../departments/department';
import { PageDepartment } from "../departments/page-department"

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private BASE_URL = environment.baseUrl;

  // Department URLs
  private ALL_DEPARTMENTS_URL = `${this.BASE_URL}/departments`;
  private CREATE_UPDATE_DEPARTMENT_URL = `${this.BASE_URL}/departments`;
  private DEPARTMENTS_SEARCH_URL = `${this.BASE_URL}/departments/search`;
  private DEPARTMENT_URL = `${this.BASE_URL}/departments/`;

  constructor(private http: HttpClient) { }

  getAllDepartments(params: HttpParams): Observable<PageDepartment> {
    return this.http.get<PageDepartment>(this.ALL_DEPARTMENTS_URL, { params });
  }

  createDepartment(department: Department): Observable<Department> {
    return this.http.post<Department>(this.CREATE_UPDATE_DEPARTMENT_URL, department);
  }

  getDepartmentByDepartmentId(departmentId: number): Observable<Department> {
    return this.http.get<Department>(this.DEPARTMENT_URL + departmentId);
  }

  updateDepartment(updateDepartment: Department): Observable<Department> {
    return this.http.put<Department>(this.DEPARTMENT_URL + updateDepartment.id, updateDepartment);
  }

}
