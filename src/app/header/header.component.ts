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
      this.selectedNavItem = this.navItems.find(navItem => this.location.path().includes(navItem.url));
      console.log("Selected nav item ",this.selectedNavItem);
    }else{
      this.selectedNavItem = this.navItems[0];
    }

  }
  onSelect(event): void {
    const selectedText = event.target.innerText;
    console.log("on select selectedText  ",selectedText);
    this.selectedNavItem = this.navItems.find(navItem => navItem.name === selectedText);
    console.log("on select selectedNavItem  ",this.selectedNavItem);
  }

  getNavigationItems(): NavItem[] {
    this.navItems = [
      new NavItem(1, "Dashboard", "/dashboard", "flaticon-line-graph"),
      new NavItem(3, "Employees", "/employees", "flaticon-users"),
      new NavItem(4, "Departments", "/departments", "flaticon-squares-4"),
      new NavItem(5, "Designations", "/designations", "flaticon-map")
    ];
    return this.navItems;
  }

}
