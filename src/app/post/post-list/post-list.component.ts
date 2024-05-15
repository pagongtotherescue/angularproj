import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { PostService } from '../posts.service';
import { Post } from '../post.model';
import { AuthService } from '../auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  private postUpdateSub!: Subscription;
  currentPage = 1;
  totalPosts = 0;
  postsPerPage = 10;
  editingPostId: string | null = null;
  currentUser: string | null = null;

  constructor(
    public postsService: PostService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef // Inject ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const page = params['page'] || 1;
      this.currentPage = page;
      this.fetchPosts();
    });

    this.currentUser = this.authService.getCurrentUserId();
    console.log('Current User ID:', this.currentUser);

    this.postUpdateSub = this.postsService.getPostUpdateListener().subscribe(posts => {
      this.posts = posts;
      this.changeDetectorRef.detectChanges(); // Trigger change detection
    });
  }

  ngOnDestroy() {
    this.postUpdateSub.unsubscribe();
  }

  fetchPosts() {
    this.postsService.getPosts(this.currentPage, this.postsPerPage).subscribe(data => {
      this.posts = data.posts;
      this.totalPosts = data.totalPosts;
      this.changeDetectorRef.detectChanges(); // Trigger change detection
    });
  }

  // like and dislike
  likePost(postId: string): void {
   this.postsService.likePost(postId).subscribe({
     next: (updatedPost) => {
       // Find the index of the updated post in the posts array
       const postIndex = this.posts.findIndex(post => post._id === updatedPost._id);
       if (postIndex!== -1) {
         // Replace the old post with the updated post
         this.posts[postIndex] = updatedPost;
       }
     },
     error: (error) => console.error('Error liking post:', error)
   });
 }
 
 dislikePost(postId: string): void {
  this.postsService.dislikePost(postId).subscribe({
      next: (response) => {
          const updatedPost = response.post;
          const postIndex = this.posts.findIndex(post => post._id === updatedPost._id);
          if (postIndex !== -1) {
              this.posts[postIndex] = updatedPost;
              this.changeDetectorRef.detectChanges(); // Trigger change detection
          }
      },
      error: (error) => console.error('Error disliking post:', error)
  });
}



  onPageChange(newPage: number) {
    this.currentPage = newPage;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: newPage },
      queryParamsHandling: 'merge'
    });
    this.fetchPosts();
  }

  isOwner(creatorObject: any): boolean {
    const creatorId = creatorObject._id;
    return creatorId === this.authService.getCurrentUserId();
  }

  onEditPost(postId: string): void {
    this.editingPostId = postId;
    this.changeDetectorRef.detectChanges(); // Trigger change detection
    // Implement logic to open the edit form or navigate to the edit page
  }

  onSavePost(post: Post) {
    this.postsService.editPost(post._id, post).subscribe({
      next: () => {
        console.log('Post saved successfully');
        this.editingPostId = null;
        this.changeDetectorRef.detectChanges(); // Trigger change detection
        this.fetchPosts();
      },
      error: (error) => console.error('Error saving post:', error)
    });
  }

  onCancelEdit(): void {
    this.editingPostId = null;
    this.changeDetectorRef.detectChanges(); // Trigger change detection
    // Implement logic to close the edit form or navigate back
  }

  onDeletePost(postId: string) {
    this.postsService.deletePost(postId).subscribe({
      next: () => {
        console.log('Post deleted successfully');
        this.posts = this.posts.filter(post => post._id!== postId);
        this.changeDetectorRef.detectChanges(); // Trigger change detection
        this.fetchPosts();
      },
      error: (error) => console.error('Error deleting post:', error)
    });
  }
}
