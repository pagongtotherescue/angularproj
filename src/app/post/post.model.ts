export interface Post {
    _id: string;
    title: string;
    content: string;
    imageUrl: string;
    likes: string[]; // Change type from number[] to string[]
    dislikes: string[]; // Change type from number[] to string[]
    creator: string;
    isLiked?: boolean; 
    isDisliked?: boolean;
}
