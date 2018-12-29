import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {Page} from "../shared/models/page";
import {Designation} from "./designation";

@Injectable({
  providedIn: 'root'
})
export class DesignationService {

  private BASE_URL = environment.baseUrl;

  // Department URLs
  private ALL_DESIGNATIONS_URL = `${this.BASE_URL}/designations`;
  private CREATE_UPDATE_DESIGNATION_URL = `${this.BASE_URL}/designations`;
  private DESIGNATION_URL = `${this.BASE_URL}/designations/`;

  constructor(private http: HttpClient) { }

  getAllDesignations(params: HttpParams): Observable<Page> {
    return this.http.get<Page>(this.ALL_DESIGNATIONS_URL, { params });
  }

  createDesignation(designation: Designation): Observable<Designation> {
    return this.http.post<Designation>(this.CREATE_UPDATE_DESIGNATION_URL, designation);
  }

  getDesignationByDesignationId(designationId: number): Observable<Designation> {
    return this.http.get<Designation>(this.DESIGNATION_URL + designationId);
  }

  updateDesignation(updateDesignation: Designation): Observable<Designation> {
    return this.http.put<Designation>(this.DESIGNATION_URL + updateDesignation.id, updateDesignation);
  }
}
