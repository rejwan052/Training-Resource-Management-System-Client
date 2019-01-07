import {Pageable} from "./pageable";

export class Page {

    content: any[];
    totalPages: number = 0;
    totalElements: number = 0;
    last: boolean;
    size: number = 0;
    number:number;
    first: boolean;
    sort: string;
    numberOfElements: number;
    pageable:Pageable = new Pageable();

}
