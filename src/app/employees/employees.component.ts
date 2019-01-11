import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ToastrService} from "ngx-toastr";
import {HttpParams} from "@angular/common/http";
import {delay} from "rxjs/operators";
import {EmployeeService} from "../employee/employee.service";
import {Page} from "../shared/models/page";
import {BsModalRef, BsModalService} from "ngx-bootstrap";
import {ConfirmationDialogComponent} from "../shared/confirmation-dialog/confirmation-dialog.component";

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {

  @ViewChild('fullName') fullNameTmpl:TemplateRef<any>;
  @ViewChild('actionButtons') actionButtonsTmpl: TemplateRef<any>;
  page:Page = new Page();
  isLoading: boolean;
  tableColumns = [];

  modalRef: BsModalRef;


  constructor(private employeeService: EmployeeService,
              private toastr: ToastrService,
              private modalService: BsModalService)
  {
              this.page.pageable.pageNumber = 0;
              this.page.size = 10;
  }

  ngOnInit() {
    this.tableColumns = [
      { name: 'Name', cellTemplate: this.fullNameTmpl},
      { name: 'Email', prop: 'email'},
      { name: 'Gender', prop: 'gender'},
      { name: 'Date of Birth', prop: 'dateOfBirth'},
      { name: 'Designation', prop: 'designation.name'},
      { name: 'Department', prop: 'department.name'},
      { name: 'Actions', prop: 'id',cellTemplate:this.actionButtonsTmpl,flexGrow: 1, sortable: false,headerClass : 'text-center',cellClass:'text-center'},
    ];
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

  editEmployee(employeeId:number) : void {
    console.log("Edit employeeId ",employeeId);
  }

  deleteEmployee(employeeId:number) : void {
    console.log("Delete employeeId ",employeeId);
    this.modalRef = this.modalService.show(ConfirmationDialogComponent, {class: 'modal-sm'});
    this.modalRef.content.onClose.subscribe(result => {
      console.log('results', result);
      if(result){
        // Employee delete service
        this.employeeService.deleteEmployee(employeeId).subscribe(
          res =>{
            this.toastr.success('', 'Employee delete successfully.');
            const params = new HttpParams().set('page', this.page.pageable.pageNumber.toString());
            this.getAllEmployees(params);
          },
          err => {
            console.log("Error occurred while delete employee ",employeeId)
          }
        );
      }else{

      }
    })
  }


}
