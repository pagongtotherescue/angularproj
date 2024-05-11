import { Injectable } from "@angular/core";
import { Post } from "./post.model";
import { Observable, Subject } from "rxjs";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { map, tap } from 'rxjs/operators';
import { AuthService } from "./auth.service";

@Injectable({
    providedIn: 'root',
})
export class PostService {
    private postUpdated = new Subject<Post[]>();
    private apiUrl = 'http://localhost:3000/api/posts';

    constructor(private http: HttpClient, private authService: AuthService) {}

    getPosts(page: number = 1, limit: number = 10): Observable<{ message: string; posts: Post[]; totalPosts: number; page: number; limit: number }> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());
    
        const token = this.authService.getToken() || '';
        const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    
        return this.http.get<{ message: string; posts: Post[]; totalPosts: number; page: number; limit: number }>(this.apiUrl, { params, headers }).pipe(
            tap(data => {
                this.postUpdated.next([...data.posts]);
            })
        );
    }
    

    getPostUpdateListener() {
        return this.postUpdated.asObservable();
    }

    // Add post
    addPost(title: string, content: string, imageUrl: string, token: string): Observable<any> {
        const postData = { title, content, imageUrl };
        const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token); // Include the user's token in the request headers
        return this.http.post(this.apiUrl, postData, { headers }).pipe(
            tap(() => {
                // Fetch the updated post list
                this.getPosts().subscribe(posts => {
                    this.postUpdated.next(posts.posts);
                });
            })
        );
    }
    
    deletePost(postId: string): Observable<any> {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found');
        }
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.delete(`${this.apiUrl}/${postId}`, { headers }).pipe(
            tap(() => {
                // Fetch the updated list post
                this.getPosts().subscribe(posts => {
                    this.postUpdated.next(posts.posts);
                });
            })
        );
    }
    
    editPost(postId: string, updatedPost: Post): Observable<any> {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found');
        }
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.put(`${this.apiUrl}/${postId}`, updatedPost, { headers }).pipe(
            tap(() => {
                // Fetch the updated list post
                this.getPosts().subscribe(posts => {
                    this.postUpdated.next(posts.posts);
                });
            })
        );
    }
}
