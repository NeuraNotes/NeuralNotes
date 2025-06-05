import { Optional } from "typescript"; // Optional not needed for interfaces, handle with '?'

// Define interfaces based on backend schemas.py

export interface NoteBase {
    title: string;
    content: string;
    label_id?: number | null; // Optional[int] maps to number | null in TS
    folder_id?: number | null; // Optional[int] maps to number | null in TS
}

export interface NoteCreate extends NoteBase {
    // No additional fields needed for creation beyond NoteBase
}

export interface NoteUpdate {
    title?: string; // Make optional for partial updates
    content?: string; // Make optional for partial updates
    label_id?: number | null; // Optional in backend schema
    folder_ids?: number[] | null; // Add optional list of folder IDs
}

export interface NoteOut extends NoteBase {
    id: number;
    owner_id: number;
    folders: FolderOut[];
    label: LabelOut | null;
}

export interface FolderBase {
    name: string;
}

export interface FolderCreate extends FolderBase {
    // No additional fields needed for creation beyond FolderBase
}

export interface FolderOut extends FolderBase {
    id: number;
}

export interface LabelBase {
    name: string;
}

export interface LabelOut extends LabelBase {
    id: number;
}

export interface UserBase {
    email: string;
    username: string;
}

export interface UserCreate extends UserBase {
    password: string;
}

// Assuming UserLogin is used for the request body, matching OAuth2PasswordRequestForm structure
export interface UserLogin {
    username: string; // Can be email or username based on your backend logic
    password: string;
}

export interface UserResponse extends UserBase {
    id: number;
    is_active: boolean;
    created_at: string; // Assuming datetime is sent as string (ISO 8601 format)
    updated_at: string; // Assuming datetime is sent as string (ISO 8601 format)
}

export interface UserOut extends UserBase {
    id: number;
}

// Interface for the login response
export interface LoginResponse {
    access_token: string;
    token_type: string;
    user: UserResponse; // Include the user details in the response
} 