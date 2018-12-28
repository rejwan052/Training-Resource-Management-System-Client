import { Component, OnInit } from '@angular/core';
import { Department } from './department';
import { ApiService } from '../shared/api.service';
import { NgForm } from '@angular/forms';
import { PageDepartment } from './page-department';
import { HttpParams } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-departments',
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.css']
})
export class DepartmentsComponent implements OnInit {

  pageDepartment: PageDepartment;
  department: Department = new Department();

  // For pagination
  selectedPage: number = 0;
  loading: boolean;
  searchTerm:string = '';

  constructor(private apiService: ApiService, private toastr: ToastrService) { }

  ngOnInit() {
    const params = new HttpParams().set('page', this.selectedPage.toString());
    this.getAllDepartments(params);
  }

  submitDepartment(form: NgForm) {
    console.log("Create Department ", this.department);
    if (this.department.id) {
      this.updateDepartment(form);
    } else {
      this.createDepartment(form);
    }
  }

  createDepartment(form: NgForm): void {
    this.apiService.createDepartment(this.department).subscribe(
      res => {
        console.log("Department create response ", res);
        this.department = new Department(res.id, res.name, res.description);
        this.pageDepartment.content.push(this.department);
        this.department = new Department();
        this.toastr.success('', 'Department create successfully.');
        form.resetForm();
        //console.log("Department page response ", this.pageDepartment);
      },
      err => {
        console.log("Department create error ", err);
        this.toastr.error('', err.error.apierror.debugMessage);
      }
    );
  }

  updateDepartment(form: NgForm): void {
    this.apiService.updateDepartment(this.department).subscribe(
      res => {
        console.log("Update department response ", res);
        const existingDepartmentIndex = this.pageDepartment.content.findIndex(d => d.id == res.id);
        this.pageDepartment.content[existingDepartmentIndex] = res;
        this.department = new Department();
        this.toastr.success('', 'Department update successfully.');
        form.resetForm();
        //console.log("Update department page response ", this.pageDepartment);
      },
      err => {
        console.log("Department update error ", err);
        this.toastr.error('', err.error.apierror.debugMessage);
      }
    );
  }

  getAllDepartments(params: HttpParams): void {
    this.loading = true;
    this.apiService.getAllDepartments(params).subscribe(
      res => {
        this.pageDepartment = res;
        this.loading = false;
      },
      err => {
        this.loading = false;
        console.log("Error occurred while get all departments;")
      }
    );
  }

  getDepartment(departmentId: number): void {
    this.apiService.getDepartmentByDepartmentId(departmentId).subscribe(
      res => {
        this.department = res;
        console.log("Get department by departmentId ", res);
      },
      err => {
        console.log("Error occurred while get all department by departmentId ", departmentId);
      }
    );
  }

  searchDepartments(): void{
    const params = new HttpParams()
                  .set('name', this.searchTerm);
    this.getAllDepartments(params);
  }

  onSelect(page: number): void {
    console.log("selected page : " + page);

    this.selectedPage = page;
    const currentPage = page > 0 ? page - 1 : 0;

    const params = new HttpParams()
      .set('name',this.searchTerm)
      .set('page', currentPage.toString());

    console.log("params ", params);
    this.getAllDepartments(params);
  }

  cancelForm(form: NgForm):void{
    form.resetForm();
    this.department = new Department();
  }

}
