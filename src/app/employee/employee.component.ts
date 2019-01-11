import {Component, OnInit} from '@angular/core';
import {EmployeeService} from "./employee.service";
import {ToastrService} from "ngx-toastr";
import {HttpParams} from "@angular/common/http";
import {delay} from "rxjs/operators";
import {Employee} from "./employee";
import {Address} from "../shared/models/address";
import {ApiService} from "../shared/api.service";
import {DesignationService} from "../designations/designation.service";
import {NgForm} from "@angular/forms";

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {

  employee: Employee = new Employee();
  employeeAddress: Address = new Address();

  designationNotFocused = false;
  departmentNotFocused = false;

  constructor(private employeeService: EmployeeService,
              private apiService: ApiService,
              private designationService: DesignationService,
              private toastr: ToastrService) {

  }

  ngOnInit() {}

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



  submitEmployee(form: NgForm): void {
    if (this.employee.id) {
      this.updateEmployee(form);
    } else {
      this.createEmployee(form);
    }
  }

  createEmployee(form: NgForm): void {
    this.employee.address = this.employeeAddress;
    this.employeeService.createEmployee(this.employee).subscribe(
      res => {
        //this.employee = res;
        this.toastr.success('', 'Employee create successfully.');
        this.resetEmployeeForm(form);
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
        this.resetEmployeeForm(form);
      },
      err => {
        console.log("Employee update error ", err);
        this.toastr.error('', err.error.apierror.debugMessage);
      }
    );
  }

  resetEmployeeForm(form: NgForm):void{
    form.resetForm();
    this.designationNotFocused = false;
    this.departmentNotFocused = false;
  }

}
