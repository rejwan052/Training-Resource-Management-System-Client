import {Component, OnInit} from '@angular/core';
import {Page} from "../shared/models/page";
import {EmployeeService} from "../employees/employee.service";
import {ToastrService} from "ngx-toastr";
import {HttpParams} from "@angular/common/http";
import {delay} from "rxjs/operators";

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {

  page:Page = new Page();
  isLoading: boolean;

  tableColumns = [
    { name: 'Name', prop: 'firstName'},
    { name: 'Email', prop: 'email'},
    { name: 'Gender', prop: 'gender'},
    { name: 'Date of Birth', prop: 'dateOfBirth'},
    { name: 'Designation', prop: 'designation.name'},
    { name: 'Department', prop: 'department.name'},
  ]

  constructor(private employeeService: EmployeeService,private toastr: ToastrService) {
    this.page.pageable.pageNumber = 0;
    this.page.size = 10;
  }

  ngOnInit() {
    this.setPage({ offset: 0 });
  }

  /**
   * Populate the table with new data based on the page number
   * @param page The page to select
   */
  setPage(pageInfo) {
    this.page.pageable.pageNumber = pageInfo.offset;
    const params = new HttpParams().set('page', this.page.pageable.pageNumber.toString());
    this.getAllEmployees(params);

  }


  getAllEmployees(params: HttpParams): void {
    this.isLoading = true;
    this.employeeService.getEmployees(params).pipe(delay(500)).subscribe(
      res => {
        this.page = res;
        this.isLoading = false;
      },
      err => {
        this.isLoading = false;
        console.log("Error occurred while get all employees;")
      }
    );
  }

}
