import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PostService } from '../posts.service';
import { Post } from '../post.model';

@Component({
 selector: 'app-post-list',
 templateUrl: './post-list.component.html',
 styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
 posts: Post[] = [];
 editingPostId: string | null = null; // Track the post being edited
 private postUpdateSub!: Subscription;

 constructor(public postsService: PostService) { }

 ngOnInit() {
    this.postsService.getPosts().subscribe((posts: Post[]) => {
      this.posts = posts;
    });

    // Subscribe to post updates
    this.postUpdateSub = this.postsService.getPostUpdateListener().subscribe(posts => {
      this.posts = posts;
    });
 }

 ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    this.postUpdateSub.unsubscribe();
 }

 onDeletePost(postId: string) {
    this.postsService.deletePost(postId).subscribe(() => {
      // Remove the deleted post from the local posts array
      this.posts = this.posts.filter(post => post._id !== postId);
    });
 }

 onEditPost(postId: string) {
    this.editingPostId = postId; // Set the post ID being edited
 }

 onSavePost(postId: string, updatedPost: Post) {
    console.log('Saving post:', updatedPost); // Debugging line
    this.postsService.editPost(postId, updatedPost).subscribe(() => {
      console.log('Post saved successfully'); // Debugging line
      // Update the local posts array with the updated post
      const index = this.posts.findIndex(post => post._id === postId);
      if (index !== -1) {
        this.posts[index] = updatedPost;
      }
      this.editingPostId = null; // Exit edit mode
    }, error => {
      console.error('Error saving post:', error); // Debugging line
    });
 }

 onCancelEdit() {
    this.editingPostId = null;
 }
 
}