import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  
  private url = "./assets/SamplePatient.json";

  constructor(private http: HttpClient) { }

  getPatientName(): Observable<any> {
    return this.http.get<any>(this.url)
      .pipe(tap(d =>{console.log(d)}), catchError(this.errorHandler)); 
  }

  // private error handler
  private errorHandler(e: HttpErrorResponse): Observable<never> {
    let err = '';
    if (e.error instanceof ErrorEvent) {
      err = `An error occured: ${e.error.message}`;
    }
    else {
      err = `Server returned ${e.status} code and error message ${e.message}`;
    }
    console.error(err);
    return throwError(err);
  }
}
