import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { PostService } from '../posts.service';

@Component({
    selector: 'app-post-create',
    templateUrl: './post-create.component.html',
    styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent {
    enteredTitle = '';
    enteredComponent = '';

    constructor(public postsService: PostService) {}


    //edit ini gari
    onAddPost(form: NgForm) {
        if (form.invalid) {
            return;
        }
        this.postsService.addPost(form.value.title, form.value.content).subscribe(() => {
  
            form.resetForm();
        });
    }
}