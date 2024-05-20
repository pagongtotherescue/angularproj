export interface Post {
    _id: string;
    title: string;
    content: string;
    imageUrl: string;
    likes: string[]; 
    dislikes: string[]; 
    creator: string;
    isLiked?: boolean; 
    isDisliked?: boolean;
    comments: Comment[]; 
}

export interface Comment {
    _id: string;
    content: string;
    creator: string;
    createdAt: Date;
}
