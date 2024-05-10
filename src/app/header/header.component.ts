import { Component, OnInit } from '@angular/core';
import { AuthService } from '../post/auth.service';
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;

  constructor(private authService: AuthService, private router: Router) { } // Inject Router

  ngOnInit(): void {
    this.authService.isAuthenticated.subscribe(isAuthenticated => {
      this.isLoggedIn = isAuthenticated;
    });
  }

  logout(): void {
    this.authService.logout().subscribe(
      () => {
        // Logout successful, update isLoggedIn directly
        this.isLoggedIn = false;
        // Redirect to login page
        this.router.navigate(['/login']);
      },
      error => {
        console.error('Logout failed:', error);
        // Handle error if necessary
      }
    );
  }
}  
