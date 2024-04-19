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
 updatedPost: Post = {
     _id: '',
     title: '',
     content: '',
     imageUrl: '',
 };
 currentPage = 1;
 totalPosts = 0;
 postsPerPage = 10;

 constructor(public postsService: PostService) { }

 ngOnInit() {
    this.fetchPosts();

    // Subscribe to post updates
    this.postUpdateSub = this.postsService.getPostUpdateListener().subscribe(posts => {
      this.posts = posts;
    });
 }

 ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    this.postUpdateSub.unsubscribe();
 }

 fetchPosts() {
    this.postsService.getPosts(this.currentPage, this.postsPerPage).subscribe(data => {
      this.posts = data.posts;
      this.totalPosts = data.totalPosts;
    });
 }

 onDeletePost(postId: string) {
    this.postsService.deletePost(postId).subscribe(() => {
      // Remove the deleted post from the local posts array
      this.posts = this.posts.filter(post => post._id !== postId);
      this.fetchPosts(); // Refresh the posts list after deletion
    });
 }

 onEditPost(postId: string) {
    this.editingPostId = postId; // Set the post ID being edited
 }

 onSavePost(post: Post) {
   console.log('Saving post:', post); // Debugging line
   this.postsService.editPost(post._id, post).subscribe(() => {
     console.log('Post saved successfully'); // Debugging line
     // Exit edit mode
     this.editingPostId = null;
     this.fetchPosts(); // Refresh the posts list after saving
   }, error => {
     console.error('Error saving post:', error); // Debugging line
   });
 }

 onCancelEdit() {
    this.editingPostId = null;
 }

 onPageChange(newPage: number) {
    this.currentPage = newPage;
    this.fetchPosts();
 }
}