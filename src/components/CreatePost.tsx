import { useMutation } from "@tanstack/react-query";
import { useState, type ChangeEvent } from "react";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";

interface PostInput {
    title: string;
    content: string;
    avatar_url: string | null;
}

const createPost = async (post: PostInput, imageFile: File) => {
    // upload image first and get the url
    const filePath = `${post.title.split(" ").join("_")}-${Date.now()}-${imageFile.name}`;

    const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(filePath, imageFile);

    if (uploadError) throw new Error(uploadError.message);

    const { data: publicUrlData } = supabase.storage
        .from("post-images")
        .getPublicUrl(filePath);

    //use the image url and then create the post

    const { data, error } = await supabase
        .from("posts")
        .insert({ ...post, image_url: publicUrlData.publicUrl });

    if (error) throw new Error(error.message);

    return data;
};

// read up on how useMutation hook works

export const CreatePost = () => {
    const [title, setTitle] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { user } = useAuth();

    const { mutate, isPending, isError } = useMutation({
        mutationFn: (data: { post: PostInput; imageFile: File }) => {
            return createPost(data.post, data.imageFile);
        },
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!selectedFile) {
            return;
        }
        mutate({
            post: {
                title,
                content,
                avatar_url: user?.user_metadata.avatar_url || null,
            },
            imageFile: selectedFile,
        });
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
            <div>
                <label htmlFor="title" className="block mb-2 font-medium">
                    Title
                </label>
                <input
                    type="text"
                    id="title"
                    required
                    onChange={(event) => setTitle(event.target.value)}
                    className="w-full border border-white/10 bg-transparent p-2 rounded"
                />
            </div>
            <div>
                <label htmlFor="content" className="block mb-2 font-medium">
                    Content
                </label>
                <textarea
                    id="content"
                    required
                    rows={5}
                    onChange={(event) => setContent(event.target.value)}
                    className="w-full border border-white/10 bg-transparent p-2 rounded"
                />
            </div>
            <div>
                <label className="block mb-2 font-medium">Upload Image</label>
                <input
                    type="file"
                    id="image"
                    accept="image/*"
                    required
                    onChange={handleFileChange}
                    className="w-full text-gray-200"
                />
            </div>

            <button
                type="submit"
                className="bg-purple-500 text-white px-4 py-2 rounded cursor-pointer"
            >
                {isPending ? "Creating..." : "Create Post"}
            </button>

            {isError && <p className="text-red-500">Error creating post.</p>}
        </form>
    );
};
