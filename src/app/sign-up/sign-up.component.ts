import { Component } from '@angular/core';
import { AuthService } from '../post/auth.service';
import { Router } from '@angular/router';

@Component({
 selector: 'app-sign-up',
 templateUrl: './sign-up.component.html',
 styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {
 username: string = '';
 password: string = '';

 constructor(private authService: AuthService, private router: Router) { }

 onSignUp() {
    this.authService.signUp(this.username, this.password).subscribe(
      (response: any) => {
        // Handle successful sign-up, e.g., redirect to login page
        this.router.navigate(['/login']);
      },
      (error: any) => {
        // Handle sign-up error 
        console.error('Sign-up failed', error);
      }
    );
 }
}