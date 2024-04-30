import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
 providedIn: 'root'
})
export class AuthService {
 private apiUrl = 'http://localhost:3000/api/auth'; // Replace with your backend API URL

 constructor(private http: HttpClient) { }

 login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password })
      .pipe(tap(response => {
        // Handle the response, e.g., store the token in local storage
        localStorage.setItem('authToken', response.token);
      }));
 }

 logout(): void {
    // Remove the token from local storage
    localStorage.removeItem('authToken');
 }
}