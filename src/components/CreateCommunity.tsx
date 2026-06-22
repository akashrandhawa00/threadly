import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../supabase-client";

interface CommunityInput {
    name: string;
    description: string;
}

const createCommunity = async (community: CommunityInput) => {
    const { data, error } = await supabase
        .from("communities")
        .insert(community);

    if (error) throw new Error(error.message);
    return data;
};

export const CreateCommunity = () => {
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { mutate, isPending, isError } = useMutation({
        mutationFn: createCommunity,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["communities"] });
            navigate("/communities");
        },
    });

    const handleSubmit = (event: React.FormEvent) => {
        event?.preventDefault();
        mutate({ name, description });
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-6xl font-bold mb-6 text-center bg-linear-to-r from-purple-500 to to-pink-500 bg-clip-text text-transparent">
                Create New Community
            </h2>
            <div>
                <label htmlFor="name" className="block mb-2 font-medium">
                    Community Name
                </label>
                <input
                    type="text"
                    id="name"
                    required
                    onChange={(e) => setName(e.target.value)}
                    className="border w-full bg-red p-2 rounded border-white/20"
                />
            </div>
            <div>
                <label htmlFor="name" className="block mb-2 font-medium">
                    Community Description
                </label>
                <textarea
                    rows={6}
                    id="description"
                    required
                    onChange={(e) => setDescription(e.target.value)}
                    className="border w-full bg-black p-2 rounded border-white/20 resize-none"
                />
            </div>

            <button
                type="submit"
                className="bg-purple-500 text-white px-4 py-2 rounded cursor-pointer"
            >
                {isPending ? "Creating..." : "Create Community"}
            </button>

            {isError && (
                <p className="text-red-500">Error creating community.</p>
            )}
        </form>
    );
};
