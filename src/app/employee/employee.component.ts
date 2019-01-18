import {Component, OnInit} from '@angular/core';
import {EmployeeService} from "./employee.service";
import {ToastrService} from "ngx-toastr";
import {debounceTime, distinctUntilChanged, switchMap, tap} from "rxjs/operators";
import {Address} from "../shared/models/address";
import {ApiService} from "../shared/api.service";
import {DesignationService} from "../designations/designation.service";
import {NgForm} from "@angular/forms";
import {ActivatedRoute, Router} from '@angular/router';
import {Subject, Subscription} from "rxjs";
import {Employee} from "./model/employee";
import {Designation} from "../designations/designation";
import {Department} from "../departments/department";
import {BsLocaleService} from 'ngx-bootstrap/datepicker';
import {listLocales} from 'ngx-bootstrap/chronos'


@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {

  employee: Employee = new Employee();
  employeeAddress: Address = new Address();

  sub: Subscription;

  designations: Designation[];
  selectedDesignation:Designation = null;
  designationLoading = false;
  designationSearchTerm$ = new Subject<string>();

  departments: Department[];
  selectedDepartment:Department = null;
  departmentLoading = false;
  departmentSearchTerm$ = new Subject<string>();

  locale = 'en';
  locales = listLocales();
  selectedDateOfBirth: Date;


  constructor(private employeeService: EmployeeService,
              private apiService: ApiService,
              private designationService: DesignationService,
              private toastr: ToastrService,
              private route: ActivatedRoute,
              private router: Router,
              private localeService: BsLocaleService) {}

  ngOnInit() {

    this.sub = this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.employeeService.getEmployeeByEmployeeId(id).subscribe((emp: Employee) => {
            if (emp){
              if(emp.dateOfBirth){
                this.selectedDateOfBirth = new Date(emp.dateOfBirth);
              }
              this.employee = new Employee(emp.id,emp.email,emp.firstName,emp.lastName,emp.gender,emp.designation,emp.department,emp.dateOfBirth);
              this.selectedDesignation = this.employee.designation;
              this.selectedDepartment = this.employee.department;
            }else{
              console.log(`Employee with id '${id}' not found!`);
            }
        });
      }
    });
    this.selectedDateOfBirth = new Date();
    this.searchDesignations();
    this.searchDepartments();

  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  submitEmployee(form: NgForm): void {
    if (this.employee.id) {
      this.updateEmployee(form);
    } else {
      this.createEmployee(form);
    }
  }

  createEmployee(form: NgForm): void {

    this.employee.address = this.employeeAddress;
    this.employee.dateOfBirth = this.selectedDateOfBirth.toISOString();

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

    this.employee.address = this.employeeAddress;
    this.employee.dateOfBirth = this.selectedDateOfBirth.toISOString();

    console.log("Update employee ",this.employee);
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
  }

  private searchDesignations() {
    this.designationSearchTerm$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => this.designationLoading = true),
      switchMap(term => {
        /*console.log("Search term ",term);*/
        return this.designationService.getDesignations(term);
      })
    ).subscribe(
      res => {
        this.designations = res;
        this.designationLoading = false;
      },
      err =>{
        console.log("Error occurred while get searching departments.");
      }
    );
  }

  onDesignationChange($event) {
    console.log("Designation change ",$event);
    this.selectedDesignation = $event;
    this.employee.designation = this.selectedDesignation;
  }

  onDesignationFocus($event){
    console.log("Designation focus ",$event);
  }


  private searchDepartments() {
    this.departmentSearchTerm$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => this.departmentLoading = true),
      switchMap(term => {
        /*console.log("Search term ",term);*/
        return this.apiService.getDepartments(term);
      })
    ).subscribe(
      res => {
        this.departments = res
        this.departmentLoading = false;
      },
      err =>{
        console.log("Error occurred while get searching departments.");
      }
    );
  }

  onDepartmentChange($event) {
    console.log("Department change ",$event);
    this.selectedDepartment = $event;
    this.employee.department = this.selectedDepartment;
  }

  onDepartmentFocus($event){
    console.log("Department focus ",$event);
  }

  applyLocale(pop: any) {
    this.localeService.use(this.locale);
    pop.hide();
    pop.show();
  }

}
