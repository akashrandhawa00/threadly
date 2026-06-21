import { useState } from "react";
import type { Comment } from "./CommentSection";
import { useAuth } from "../context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase-client";

interface Props {
    comment: Comment & { children?: Comment[] };
    postId: number;
}

const createReply = async (
    replyContent: string,
    postId: number,
    parentCommentId: number,
    userId?: string,
    author?: string,
) => {
    if (!userId || !author) {
        throw new Error("You must be logged in to reply.");
    }

    const { error } = await supabase.from("comments").insert({
        post_id: postId,
        content: replyContent,
        parent_comment_id: parentCommentId,
        user_id: userId,
        author: author,
    });

    if (error) throw new Error(error.message);
};

export const CommentItem = ({ comment, postId }: Props) => {
    const [showReply, setShowReply] = useState<boolean>(false);
    const [replyText, setReplyText] = useState<string>("");

    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { mutate, isPending, isError } = useMutation({
        mutationFn: (replyContent: string) =>
            createReply(
                replyContent,
                postId,
                comment.id,
                user?.id,
                user?.user_metadata.user_name,
            ),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments", postId] });
            setReplyText("");
            setShowReply(false);
        },
    });

    const handleReplySubmit = (event: React.FormEvent) => {
        event?.preventDefault();

        if (!replyText) return;
        mutate(replyText);
    };

    return (
        <div className="pl-4 border-l border-white/10">
            <div className="mb-2">
                <div className="flex items-center space-x-2">
                    {/* commenters username here */}

                    <span className="text-sm font-bold text-blue-400">
                        {comment.author}
                    </span>
                    <span className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString(
                            "en-US",
                            {
                                hour: "2-digit",
                                minute: "2-digit",
                                month: "long",
                                year: "numeric",
                                day: "2-digit",
                            },
                        )}
                    </span>
                </div>
                <p className="text-gray-300">{comment.content}</p>
                <button
                    onClick={() => setShowReply((prev) => !prev)}
                    className="text-blue-500 text-sm mt-1"
                >
                    {showReply ? "Cancel" : "Reply"}
                </button>
            </div>

            {showReply && user && (
                <form onSubmit={handleReplySubmit} className="mb-2">
                    <textarea
                        rows={2}
                        placeholder="Write a comment..."
                        value={replyText}
                        onChange={(event) => setReplyText(event.target.value)}
                        className="w-full border border-white/10 bg-transparent p-2 rounded resize-none"
                    />
                    <button
                        type="submit"
                        disabled={!replyText}
                        className="bg-blue-500 rounded mt-1 px-3 py-1 text-white"
                    >
                        {isPending ? "Posting..." : "Post Reply"}
                    </button>
                    {isError && (
                        <p className="text-red-500 mt-2">
                            Error posting reply.
                        </p>
                    )}
                </form>
            )}
        </div>
    );
};
