export class NavItem {

  public id : number;
  public name : string;
  public url : string;
  public icon : string;

  constructor(id?: number, name?: string, url?: string, icon?: string) {
    this.id = id;
    this.name = name;
    this.url = url;
    this.icon = icon;
  }
}
