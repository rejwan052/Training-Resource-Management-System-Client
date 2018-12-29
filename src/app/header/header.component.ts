import { Component, OnInit } from '@angular/core';
import {NavItem} from "./nav-item";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  navItems : NavItem[];
  selectedNavItem : NavItem;

  constructor() { }

  ngOnInit() {
    this.navItems = [
      new NavItem(1,"Dashboard","/dashboard","flaticon-line-graph"),
      new NavItem(2,"Employees","/employees","flaticon-users"),
      new NavItem(3,"Departments","/departments","flaticon-squares-4"),
      new NavItem(4,"Designations","/designations","flaticon-map")
    ];
    this.selectedNavItem = this.navItems[0];
    console.log("Nav items",this.navItems);
  }
  onSelect(event): void {
    const selectedText = event.target.innerText;
    this.selectedNavItem = this.navItems.find(navItem => navItem.name === selectedText);
    // console.log("Dropdown selected nav item",this.selectedNavItem);
  }

}
