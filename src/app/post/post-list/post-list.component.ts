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
    const postIndex = this.posts.findIndex(post => post._id === postId);
    if (postIndex !== -1) {
      this.posts[postIndex].likes[0] = String(Number(this.posts[postIndex].likes[0]) + 1); // Convert to string and increment
      this.postsService.likePost(postId).subscribe({
        next: () => console.log('Post liked successfully'),
        error: (error) => {
          console.error('Error liking post:', error);
          this.posts[postIndex].likes[0] = String(Number(this.posts[postIndex].likes[0]) - 1); // Rollback on error
        }
      });
    }
  }

  dislikePost(postId: string): void {
    const postIndex = this.posts.findIndex(post => post._id === postId);
    if (postIndex !== -1) {
      this.posts[postIndex].dislikes[0] = String(Number(this.posts[postIndex].dislikes[0]) + 1); // Convert to string and increment
      this.postsService.dislikePost(postId).subscribe({
        next: () => console.log('Post disliked successfully'),
        error: (error) => {
          console.error('Error disliking post:', error);
          this.posts[postIndex].dislikes[0] = String(Number(this.posts[postIndex].dislikes[0]) - 1); // Rollback on error
        }
      });
    }
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
