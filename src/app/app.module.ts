import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {HeaderComponent} from './header/header.component';
import {NotFoundComponent} from './not-found/not-found.component';
import {EmployeesComponent} from './employees/employees.component';
import {DepartmentsComponent} from './departments/departments.component';
import {DesignationsComponent} from './designations/designations.component';
import {AppRoutingModule} from './app-routing.module';
import {BsDatepickerModule} from "ngx-bootstrap/datepicker";
import {FormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {NgxPaginationModule} from "ngx-pagination";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ToastrModule} from 'ngx-toastr';
import {DashboardComponent} from './dashboard/dashboard.component';
import {BsDropdownModule} from 'ngx-bootstrap/dropdown';
import {FooterComponent} from './footer/footer.component';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {EmployeeComponent} from './employee/employee.component';
import {ConfirmationDialogComponent} from './shared/confirmation-dialog/confirmation-dialog.component';
import {ModalModule} from "ngx-bootstrap";
import {NgSelectModule} from '@ng-select/ng-select';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    NotFoundComponent,
    EmployeesComponent,
    DepartmentsComponent,
    DesignationsComponent,
    DashboardComponent,
    FooterComponent,
    EmployeeComponent,
    ConfirmationDialogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BsDatepickerModule.forRoot(),
    HttpClientModule,
    FormsModule,
    NgxPaginationModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    BsDropdownModule.forRoot(),
    NgxDatatableModule,
    ModalModule.forRoot(),
    NgSelectModule
  ],
  entryComponents:[ConfirmationDialogComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
