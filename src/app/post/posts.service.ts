import { Injectable } from "@angular/core";
import { Post } from "./post.model";
import { Observable, Subject } from "rxjs";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { tap } from 'rxjs/operators';
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private postUpdated = new Subject<Post[]>();
  private apiUrl = 'http://localhost:3000/api/posts';
  private posts: Post[] = [];

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

  addPost(title: string, content: string, imageUrl: string): Observable<any> {
    const postData = { title, content, imageUrl };
    const token = this.authService.getToken() || '';
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post(this.apiUrl, postData, { headers }).pipe(
        tap(() => {
            this.getPosts().subscribe(posts => {
                this.postUpdated.next(posts.posts);
            });
        })
    );
  }
  
  deletePost(postId: string): Observable<any> {
    const token = this.authService.getToken() || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.apiUrl}/${postId}`, { headers }).pipe(
        tap(() => {
            this.getPosts().subscribe(posts => {
                this.postUpdated.next(posts.posts);
            });
        })
    );
  }
  
  editPost(postId: string, updatedPost: Post): Observable<any> {
    const token = this.authService.getToken() || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/${postId}`, updatedPost, { headers }).pipe(
        tap(() => {
            this.getPosts().subscribe(posts => {
                this.postUpdated.next(posts.posts);
            });
        })
    );
  }

  likePost(postId: string): Observable<any> {
    const token = this.authService.getToken() || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/${postId}/like`, {}, { headers }).pipe(
        tap(() => {
            this.getPosts().subscribe(posts => {
                this.postUpdated.next(posts.posts);
            });
        })
    );
  }

  dislikePost(postId: string): Observable<any> {
    const token = this.authService.getToken() || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/${postId}/dislike`, {}, { headers }).pipe(
        tap(() => {
            this.getPosts().subscribe(posts => {
                this.postUpdated.next(posts.posts);
            });
        })
    );
  }

  getComments(postId: string): Observable<any> {
    const token = this.authService.getToken() || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/${postId}/comments`, { headers });
  }

  addComment(postId: string, content: string, parentId?: string): Observable<any> {
    const token = this.authService.getToken() || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const commentData = { content, parentId };
    return this.http.post(`${this.apiUrl}/${postId}/comments`, commentData, { headers }).pipe(
        tap(() => {
            this.getPosts().subscribe(posts => {
                this.postUpdated.next(posts.posts);
            });
        })
    );
  }
}
