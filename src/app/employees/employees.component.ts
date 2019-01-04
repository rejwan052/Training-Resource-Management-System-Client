import {Component, OnInit} from '@angular/core';
import {ApiService} from "../shared/api.service";
import {DesignationService} from "../designations/designation.service";
import {ToastrService} from "ngx-toastr";
import {HttpParams} from "@angular/common/http";
import {delay} from "rxjs/operators";
import {NgForm} from "@angular/forms";
import {Employee} from "./employee";
import {Address} from "../shared/models/address";
import {EmployeeService} from "./employee.service";

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {

  employee: Employee = new Employee();
  employeeAddress: Address = new Address();

  designationNotFocused = false;
  departmentNotFocused = false;
  designationConfig: any =  {
    labelField: 'name',
    valueField: 'id',
    searchField: ['name'],
    create: false,
    preload:true,
    load: ((query, callback) => {
      const params = new HttpParams().set('name', query);
      this.designationService.getAllDesignations(params).pipe(delay(500)).subscribe(
        res => {
          callback(res.content);
        },
        err => {
          callback();
          console.log("Error occurred while get all designations;")
        }
      );
    }).bind(this)
  };

  ngOnInit() {
  }
  departmentConfig: any =  {
    labelField: 'name',
    valueField: 'id',
    searchField: ['name'],
    create: false,
    preload:true,
    load: ((query, callback) => {
      const params = new HttpParams().set('name', query);
      this.apiService.getAllDepartments(params).pipe(delay(500)).subscribe(
          res => {
            callback(res.content);
          },
          err => {
            callback();
            console.log("Error occurred while get all departments;")
          }
        );
    }).bind(this)
  };

  constructor(private employeeService: EmployeeService,
              private apiService: ApiService,
              private designationService: DesignationService,
              private toastr: ToastrService) {
  }

  submitEmployee(form: NgForm): void {
    if (this.employee.id) {
      this.updateEmployee(form);
    } else {
      this.createEmployee(form);
    }
  }

  createEmployee(form: NgForm): void {
    this.employeeService.createEmployee(this.employee).subscribe(
      res => {
        //this.employee = res;
        this.toastr.success('', 'Employee create successfully.');
        form.resetForm();
        this.designationNotFocused = false;
        this.departmentNotFocused = false;
      },
      err => {
        console.log("Employee create error ", err);
        this.toastr.error('', err.error.apierror.debugMessage);
      }
    );
  }

  updateEmployee(form: NgForm): void {
    this.employeeService.updateEmployee(this.employee).subscribe(
      res => {
        console.log("Update employee response ", res);
        this.toastr.success('', 'Employee update successfully.');
        form.resetForm();
        this.designationNotFocused = false;
        this.departmentNotFocused = false;
      },
      err => {
        console.log("Employee update error ", err);
        this.toastr.error('', err.error.apierror.debugMessage);
      }
    );
  }




}
