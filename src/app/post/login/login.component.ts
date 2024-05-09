// login.component.ts

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
 selector: 'app-login',
 templateUrl: './login.component.html',
 styleUrls: ['./login.component.css']
})
export class LoginComponent {
 username: string = '';
 password: string = '';
 errorMessage: string = ''; // Add a variable to hold error messages

 constructor(private authService: AuthService, private router: Router) { }

 login() {
    // Call the login method from AuthService
    this.authService.login(this.username, this.password).subscribe(
      (response: any) => {
        // Redirect to some page after successful login
        this.router.navigate(['/dashboard']);
      },
      (error: any) => {
        // Handle login error
        console.error('Login failed', error);
        this.errorMessage = 'Invalid username or password'; // Display error message
      }
    );
 }
}
