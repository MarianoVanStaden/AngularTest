import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestserService {
  private url = "https://api.restful-api.dev/objects"
  
  constructor(private http: HttpClient) { }

  getAll(): Observable<any>{
    return this.http.get(this.url)
  }
}
