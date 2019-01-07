import {Component, OnInit} from '@angular/core';
import {NavItem} from "./nav-item";
import {Location} from "@angular/common";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  navItems : NavItem[];
  selectedNavItem : NavItem;

  constructor(private location: Location) {
  }

  ngOnInit() {
    this.getNavigationItems();
    console.log("Location path:", this.location.path());
    if(this.location.path()){
      this.selectedNavItem = this.navItems.find(navItem => navItem.url === this.location.path());
    }else{
      this.selectedNavItem = this.navItems[0];
    }

  }
  onSelect(event): void {
    const selectedText = event.target.innerText;
    this.selectedNavItem = this.navItems.find(navItem => navItem.name === selectedText);
  }

  getNavigationItems(): NavItem[] {
    this.navItems = [
      new NavItem(2, "Dashboard", "/dashboard", "flaticon-line-graph"),
      new NavItem(2, "Create Employee", "/employee", "flaticon-plus"),
      new NavItem(3, "Employee List", "/employees", "flaticon-users"),
      new NavItem(4, "Departments", "/departments", "flaticon-squares-4"),
      new NavItem(5, "Designations", "/designations", "flaticon-map")
    ];
    return this.navItems;
  }

}
