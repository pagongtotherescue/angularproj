import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api'; // Backend API URL
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    // Upon initialization, check if token exists in local storage
    const token = localStorage.getItem('token');
    if (token) {
      this.setToken(token);
      this.setAuthenticationStatus(true);
    }
  }

  private setAuthenticationStatus(isAuthenticated: boolean): void {
    this.isAuthenticatedSubject.next(isAuthenticated);
  }

  // Method to set the user's token
  setToken(token: string): void {
    localStorage.setItem('token', token); // Store token in local storage
  }

  // Method to get the user's token
  getToken(): string | null {
    return localStorage.getItem('token');
  }  

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap((response) => {
          this.setToken(response.token); // Set the token received from the server
          this.setAuthenticationStatus(true);
        }),
        catchError(error => {
          console.error('Login failed:', error);
          return throwError(error);
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logout`, {})
      .pipe(
        tap(() => {
          // Clear authentication status on successful logout
          this.setAuthenticationStatus(false);
          // Clear any authentication-related information stored locally
          localStorage.removeItem('token'); // Remove token from local storage
        }),
        catchError(error => {
          console.error('Logout failed:', error);
          return throwError(error);
        })
      );
  }

  signUp(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signup`, { username, password })
      .pipe(
        catchError(error => {
          console.error('Signup failed:', error);
          return throwError(error);
        })
      );
  }
}