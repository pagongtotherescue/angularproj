import { Injectable } from "@angular/core";
import { Post } from "./post.model";
import { Observable, Subject } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { map, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class PostService {
    private postUpdated = new Subject<Post[]>();
    private apiUrl = 'http://localhost:3000/api/posts';

    constructor(private http: HttpClient) { }

    getPosts(page: number = 1, limit: number = 10): Observable<{ message: string; posts: Post[]; totalPosts: number; page: number; limit: number }> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());
        return this.http.get<{ message: string; posts: Post[]; totalPosts: number; page: number; limit: number }>(this.apiUrl, { params }).pipe(
            map(data => {
                this.postUpdated.next([...data.posts]);
                return data;
            })
        );
    }

    getPostUpdateListener() {
        return this.postUpdated.asObservable();
    }

    // Add post
    addPost(title: string, content: string, imageUrl: string): Observable<any> {
        const postData = { title, content, imageUrl };
        return this.http.post(this.apiUrl, postData).pipe(
            tap(() => {
                // Fetch the updated post
                this.getPosts().subscribe(posts => {
                    this.postUpdated.next(posts.posts);
                });
            })
        );
    }
    
    deletePost(postId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${postId}`).pipe(
            tap(() => {
                // Fetch the updated list post
                this.getPosts().subscribe(posts => {
                    this.postUpdated.next(posts.posts);
                });
            })
        );
    }
    
    editPost(postId: string, updatedPost: Post): Observable<any> {
        return this.http.put(`${this.apiUrl}/${postId}`, updatedPost).pipe(
            tap(() => {
                // Fetch the updated list post
                this.getPosts().subscribe(posts => {
                    this.postUpdated.next(posts.posts);
                });
            })
        );
    }
}