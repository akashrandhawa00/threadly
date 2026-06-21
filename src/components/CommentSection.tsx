import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { CommentItem } from "./CommentItem";

interface Props {
    postId: number;
}

interface NewComment {
    content: string;
    parent_comment_id?: number | null;
}

export interface Comment {
    id: number;
    post_id: number;
    parent_comment_id: number | null;
    content: string;
    user_id: string;
    created_at: string;
    author: string;
}

const createComment = async (
    newComment: NewComment,
    postId: number,
    userId?: string,
    author?: string,
) => {
    if (!userId || !author) {
        throw new Error("You must be logged in to comment.");
    }

    const { error } = await supabase.from("comments").insert({
        post_id: postId,
        content: newComment.content,
        parent_comment_id: newComment.parent_comment_id || null,
        user_id: userId,
        author: author,
    });

    if (error) throw new Error(error.message);
};

const fetchComments = async (postId: number): Promise<Comment[]> => {
    const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);

    return data as Comment[];
};

export const CommentSection = ({ postId }: Props) => {
    const [newCommentText, setNewCommentText] = useState<string>("");
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const {
        data: comments,
        isLoading,
        error,
    } = useQuery<Comment[], Error>({
        queryKey: ["comments", postId],
        queryFn: () => fetchComments(postId),
        refetchInterval: 50000,
    });

    const { mutate, isPending, isError } = useMutation({
        mutationFn: (newComment: NewComment) =>
            createComment(
                newComment,
                postId,
                user?.id,
                user?.user_metadata.user_name,
            ),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments", postId] });
        },
    });

    const handleSubmit = (event: React.FormEvent) => {
        event?.preventDefault();

        if (!newCommentText) return;
        mutate({ content: newCommentText, parent_comment_id: null });
        setNewCommentText("");
    };

    // map of comments --> organize replies --> return tree
    // watch 2:50:00

    const buildCommentTree = (
        flatComment: Comment[],
    ): (Comment & { children?: Comment[] })[] => {
        const map = new Map<number, Comment & { children?: Comment[] }>();
        const rootComments: (Comment & { children?: Comment[] })[] = [];

        flatComment.forEach((comment) => {
            map.set(comment.id, { ...comment, children: [] });
        });

        flatComment.forEach((comment) => {
            if (comment.parent_comment_id) {
                const parent = map.get(comment.parent_comment_id);
                if (parent) {
                    parent.children!.push(map.get(comment.id)!);
                }
            } else {
                rootComments.push(map.get(comment.id)!);
            }
        });

        return rootComments;
    };

    if (isLoading) {
        return <div>Loading comments...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    const commentTree = comments ? buildCommentTree(comments) : [];

    return (
        <div className="mt-6">
            <h3 className="text-2xl font-semibold mb-4">Comments</h3>

            {/* create comment section */}
            {user ? (
                <form onSubmit={handleSubmit}>
                    <textarea
                        rows={3}
                        placeholder="Write a comment..."
                        value={newCommentText}
                        onChange={(event) =>
                            setNewCommentText(event.target.value)
                        }
                        className="w-full border border-white/10 bg-transparent p-2 rounded resize-none"
                    />
                    <button
                        type="submit"
                        disabled={!newCommentText}
                        className="bg-purple-500 rounded cursor-pointer mt-2 px-4 py-2 mb-6"
                    >
                        {isPending ? "Posting..." : "Post Comment"}
                    </button>
                    {isError && (
                        <p className="text-red-500 mt-2">
                            Error posting comment.
                        </p>
                    )}
                </form>
            ) : (
                <p className="mb-4 text-gray-600">
                    You must be logged in to post a comment
                </p>
            )}

            {/* comments display section */}
            <div className="space-y-4">
                {commentTree.map((comment, key) => (
                    <CommentItem key={key} comment={comment} postId={postId} />
                ))}
            </div>
        </div>
    );
};
