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
  comments: any[] = [];
  newComment: string = '';
  newReply: string = '';
  replyToCommentId: string | null = null;
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
    private changeDetectorRef: ChangeDetectorRef
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
      this.posts.forEach(post => this.fetchComments(post._id)); // Fetch comments for each post
      this.changeDetectorRef.detectChanges();
    });

    this.fetchPosts();
  }

  ngOnDestroy() {
    this.postUpdateSub.unsubscribe();
  }

  fetchPosts() {
    this.postsService.getPosts(this.currentPage, this.postsPerPage).subscribe(data => {
      this.posts = data.posts;
      this.totalPosts = data.totalPosts;
      this.posts.forEach(post => this.fetchComments(post._id)); // Fetch comments for each post
      this.changeDetectorRef.detectChanges();
    });
  }

  fetchComments(postId: string) {
    this.postsService.getComments(postId).subscribe(comments => {
      this.comments = this.comments.filter(comment => comment.postId !== postId).concat(comments);
      this.changeDetectorRef.detectChanges();
    });
  }

  addComment(postId: string) {
    if (this.newComment.trim() !== '') {
      this.postsService.addComment(postId, this.newComment).subscribe(comment => {
        this.comments.push(comment);
        this.newComment = '';
        this.changeDetectorRef.detectChanges();
      });
    }
  }

  addReply(postId: string, commentId: string) {
    if (this.newReply.trim() !== '') {
      this.postsService.addComment(postId, this.newReply, commentId).subscribe(reply => {
        // Locate the parent comment and add the reply to its children
        const parentCommentIndex = this.comments.findIndex(comment => comment._id === commentId);
        if (parentCommentIndex !== -1) {
          if (!this.comments[parentCommentIndex].replies) {
            this.comments[parentCommentIndex].replies = [];
          }
          this.comments[parentCommentIndex].replies.push(reply);
        }
        this.newReply = '';
        this.replyToCommentId = null;
        this.changeDetectorRef.detectChanges();
      });
    }
  }

  likePost(postId: string): void {
    this.postsService.likePost(postId).subscribe({
      next: (updatedPost) => {
        const postIndex = this.posts.findIndex(post => post._id === updatedPost._id);
        if (postIndex !== -1) {
          this.posts[postIndex] = updatedPost;
        }
        this.changeDetectorRef.detectChanges();
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
          this.changeDetectorRef.detectChanges();
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
    this.changeDetectorRef.detectChanges();
  }

  onSavePost(post: Post) {
    this.postsService.editPost(post._id, post).subscribe({
      next: () => {
        console.log('Post saved successfully');
        this.editingPostId = null;
        this.changeDetectorRef.detectChanges();
        this.fetchPosts();
      },
      error: (error) => console.error('Error saving post:', error)
    });
  }

  onCancelEdit(): void {
    this.editingPostId = null;
    this.changeDetectorRef.detectChanges();
  }

  onDeletePost(postId: string) {
    this.postsService.deletePost(postId).subscribe({
      next: () => {
        console.log('Post deleted successfully');
        this.posts = this.posts.filter(post => post._id !== postId);
        this.changeDetectorRef.detectChanges();
        this.fetchPosts();
      },
      error: (error) => console.error('Error deleting post:', error)
    });
  }
}
