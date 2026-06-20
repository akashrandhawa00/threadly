import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "../supabase-client";

interface PostInput {
    title: string;
    content: string;
}

const createPost = async (post: PostInput) => {
    const { data, error } = await supabase.from("posts").insert([post]);

    if (error) throw new Error(error.message);

    return data;
};

// read up on how useMutation hook works

export const CreatePost = () => {
    const [title, setTitle] = useState<string>("");
    const [content, setContent] = useState<string>("");

    const {} = useMutation({ mutationFn: createPost });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
    };

    return (
        <form>
            <div>
                <label>Title</label>
                <input
                    type="text"
                    id="title"
                    required
                    onChange={(event) => setTitle(event.target.value)}
                />
            </div>
            <div>
                <label>Content</label>
                <textarea
                    id="content"
                    required
                    rows={5}
                    onChange={(event) => setTitle(event.target.value)}
                />
            </div>

            <button type="submit">Create Post</button>
        </form>
    );
};
