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
    this.authService.logout(); 
    this.router.navigate(['/login']); // Access Router property to navigate
  }
}
