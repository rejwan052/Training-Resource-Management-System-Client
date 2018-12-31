import {Component, OnInit} from '@angular/core';
import {ApiService} from "../shared/api.service";
import {DesignationService} from "../designations/designation.service";
import {ToastrService} from "ngx-toastr";
import {HttpParams} from "@angular/common/http";
import {delay} from "rxjs/operators";

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {

  constructor(private apiService : ApiService,private designationService : DesignationService,private toastr: ToastrService) { }

  ngOnInit() {
  }


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
          callback()
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
            callback()
            console.log("Error occurred while get all departments;")
          }
        );
    }).bind(this)
  };




}
