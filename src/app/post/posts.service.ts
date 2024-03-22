import { Injectable } from "@angular/core";
import { Post } from "./post.model";
import { Observable, Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class PostService {
    private postUpdated = new Subject<Post[]>();
    private apiUrl = 'http://localhost:3000/api/posts';

    constructor(private http: HttpClient) { }

    getPosts(): Observable<Post[]> {
        return this.http.get<{ message: string; posts: Post[] }>(this.apiUrl).pipe(
            map(data => {
                this.postUpdated.next([...data.posts]);
                return data.posts;
            })
        );
    }

    getPostUpdateListener() {
        return this.postUpdated.asObservable();
    }

// Add post
    addPost(title: string, content: string,): Observable<any> {
        const postData = { title, content, };
        return this.http.post(this.apiUrl, postData).pipe(
            tap(() => {
                // Fetch the updated post
                this.getPosts().subscribe(posts => {
                    this.postUpdated.next(posts);
                });
            })
        );
    }
    
    deletePost(postId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${postId}`).pipe(
            tap(() => {
                // Fetch the updated list post
                this.getPosts().subscribe(posts => {
                    this.postUpdated.next(posts);
                });
            })
        );
    }
    
    editPost(postId: string, updatedPost: Post): Observable<any> {
        return this.http.put(`${this.apiUrl}/${postId}`, updatedPost).pipe(
            tap(() => {

            })
        );
    }
    
}