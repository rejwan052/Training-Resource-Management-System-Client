import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DepartmentsComponent} from "./departments/departments.component";
import {DesignationsComponent} from "./designations/designations.component";
import {NotFoundComponent} from "./not-found/not-found.component";
import {EmployeesComponent} from "./employees/employees.component";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {EmployeeComponent} from "./employee/employee.component";


const routes : Routes = [
  {path : '',redirectTo : 'dashboard', pathMatch : 'full'},
  {path : 'dashboard',component : DashboardComponent},
  {path : 'employee',component : EmployeeComponent},
  // {path : 'employees',component : EmployeesComponent},
  // {path : 'employees/:id',component : EmployeeComponent},
  { path: 'employees',
    children: [
      { path: '', component: EmployeesComponent },
      { path: ':id', component: EmployeeComponent }
    ]
  },
  {path : 'departments',component : DepartmentsComponent},
  {path : 'designations',component : DesignationsComponent},
  {path : '**', component : NotFoundComponent}
];



@NgModule({
  imports : [RouterModule.forRoot(routes,{enableTracing:false})],
  exports : [RouterModule]
})
export class AppRoutingModule { }
