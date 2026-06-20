import { useMutation } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";

interface Props {
    postId: number;
}

const vote = async (voteValue: number, postId: number, userId: string) => {
    const {} = await supabase
        .from("votes")
        .insert({ post_Id: postId, user_id: userId, vote: voteValue });
};

export const LikeButton = ({ postId }: Props) => {
    const { user } = useAuth();

    const { mutate } = useMutation({
        mutationFn: (voteValue: number) => {
            if (!user) throw new Error("You must be logged in to Vote!");
            return vote(voteValue, postId, user.id);
        },
    });

    return (
        <div>
            <button onClick={() => mutate(1)}>Like</button>
            <button onClick={() => mutate(-1)}>Dislike</button>
        </div>
    );
};
