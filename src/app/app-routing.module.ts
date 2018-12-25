import { NgModule } from '@angular/core';
import { RouterModule,Routes } from '@angular/router';
import {DepartmentsComponent} from "./departments/departments.component";
import {DesignationsComponent} from "./designations/designations.component";
import {NotFoundComponent} from "./not-found/not-found.component";
import {EmployeesComponent} from "./employees/employees.component";


const routes : Routes = [
  {path : '',redirectTo : 'employees', pathMatch : 'full'},
  {path : 'employees',component : EmployeesComponent},
  {path : 'departments',component : DepartmentsComponent},
  {path : 'designations',component : DesignationsComponent},
  {path : '**', component : NotFoundComponent}
];



@NgModule({
  imports : [RouterModule.forRoot(routes,{enableTracing:false})],
  exports : [RouterModule]
})
export class AppRoutingModule { }
