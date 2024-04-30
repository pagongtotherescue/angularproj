import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostCreateComponent } from './post/post-create/post-create.component';
import { PostListComponent } from './post/post-list/post-list.component';
import { LoginComponent } from './post/login/login.component';

const routes: Routes = [
 { path: '', redirectTo: '/posts', pathMatch: 'full' },
 { path: 'login', component: LoginComponent }, 
 { path: 'create-post', component: PostCreateComponent },
 { path: 'posts', component: PostListComponent },
 // Add other routes as needed
];

@NgModule({
 imports: [RouterModule.forRoot(routes)],
 exports: [RouterModule]
})
export class AppRoutingModule { }