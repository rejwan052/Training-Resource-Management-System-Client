import {Component, OnInit} from '@angular/core';
import {Page} from "../shared/models/page";
import {Designation} from "./designation";
import {DesignationService} from "./designation.service";
import {ToastrService} from "ngx-toastr";
import {HttpParams} from "@angular/common/http";
import {NgForm} from "@angular/forms";
import {delay} from "rxjs/operators";

@Component({
  selector: 'app-designations',
  templateUrl: './designations.component.html',
  styleUrls: ['./designations.component.css']
})
export class DesignationsComponent implements OnInit {

  designationPage:Page;
  designation:Designation = new Designation();

  // For pagination & search
  selectedPage: number = 0;
  loading: boolean;
  searchTerm:string = '';

  constructor(private designationService:DesignationService, private toastr: ToastrService) { }

  ngOnInit() {
    const params = new HttpParams().set('page', this.selectedPage.toString());
    this.getAllDesignations(params);
  }

  submitDesignation(form: NgForm) {
    if (this.designation.id) {
      this.updateDesignation(form);
    } else {
      this.createDesignation(form);
    }
  }

  createDesignation(form: NgForm): void {
    this.designationService.createDesignation(this.designation).subscribe(
      res => {
        console.log("Designation create response ", res);
        this.designation = new Designation(res.id, res.name);
        this.designationPage.content.push(this.designation);

        if(this.designationPage.totalElements > 0)
          this.designationPage.totalElements = this.designationPage.totalElements + 1;

        this.designation = new Designation();
        this.toastr.success('', 'Designation create successfully.');
        console.log("designation page in create ",this.designationPage);
        form.resetForm();
        //console.log("Designation page response ", this.designationPage);
      },
      err => {
        console.log("Designation create error ", err);
        this.toastr.error('', err.error.apierror.debugMessage);
      }
    );
  }

  updateDesignation(form: NgForm): void {
    this.designationService.updateDesignation(this.designation).subscribe(
      res => {
        console.log("Update department response ", res);
        const existingDesignationIndex = this.designationPage.content.findIndex(d => d.id == res.id);
        this.designationPage.content[existingDesignationIndex] = res;
        this.designation = new Designation();
        this.toastr.success('', 'Designation update successfully.');
        form.resetForm();
        //console.log("Update designation page response ", this.designationPage);
      },
      err => {
        console.log("Designation update error ", err);
        this.toastr.error('', err.error.apierror.debugMessage);
      }
    );
  }

  getAllDesignations(params: HttpParams): void {
    this.loading = true;
    this.designationService.getAllDesignations(params).pipe(delay(500)).subscribe(
      res => {
        this.designationPage = res;
        this.loading = false;
      },
      err => {
        this.loading = false;
        console.log("Error occurred while get all designations;")
      }
    );
  }

  getDesignation(designationId: number): void {
    this.designationService.getDesignationByDesignationId(designationId).subscribe(
      res => {
        this.designation = res;
        console.log("Get designation by designationId ", res);
      },
      err => {
        console.log("Error occurred while get all designation by designationId ", designationId);
      }
    );
  }

  searchDesignations(): void{
    const params = new HttpParams()
      .set('name', this.searchTerm);
    this.getAllDesignations(params);
  }

  onSelect(page: number): void {
    console.log("selected page : " + page);

    this.selectedPage = page;
    const currentPage = page > 0 ? page - 1 : 0;

    const params = new HttpParams()
      .set('name',this.searchTerm)
      .set('page', currentPage.toString());

    console.log("params ", params);
    this.getAllDesignations(params);
  }

  cancelForm(form: NgForm):void{
    form.resetForm();
    this.designation = new Designation();
  }

}
