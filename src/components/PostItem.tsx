import { Link } from "react-router";
import type { Post } from "./PostList";
import { FaComment, FaHeart } from "react-icons/fa";

interface Props {
    post: Post;
}

export const PostItem = ({ post }: Props) => {
    return (
        <div className="relative group">
            <div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-pink-600 to-purple-600 blur-sm opacity-0 group-hover:opacity-50 transition duration-300 pointer-events-none" />
            <Link to={`/post/${post.id}`} className="block relative z-10">
                <div className="sm:w-80 sm:h-76  bg-[rgb(24,27,32)] border border-[rgb(84,90,106)] rounded-2xl text-white flex flex-col p-5 overflow-hidden transition-colors duration-300 group-hover:bg-gray-800">
                    {/* profile image and title */}
                    <div className="flex items-center space-x-2">
                        {post.avatar_url ? (
                            <img
                                src={post.avatar_url}
                                alt="User avatar"
                                className="rounded-full object-cover w-8.75 h-8.75 "
                            />
                        ) : (
                            <div className="w-8.75 h-8.75 rounded-full bg-linear-to-tl from-[#8a2be2] to-[#491f70]" />
                        )}
                        <div className="flex flex-col flex-1">
                            <div className="text-[20px] leading-5.5 font-semibold mt-2">
                                {post.title}
                            </div>
                        </div>
                    </div>

                    {/* imgage banner */}
                    <div className="mt-2 flex-1">
                        <img
                            src={post.image_url}
                            alt={post.title}
                            className="w-full rounded-2xl object-cover max-h-37.5 mx-auto"
                        />
                    </div>
                    <div className="flex justify-around items-center">
                        <span className="h-10 w-12.5 px-1 flex items-center justify-center font-extrabold rounded-lg">
                            <FaHeart />{" "}
                            <span className="ml-2">{post.like_count ?? 0}</span>
                        </span>
                        <span className="h-10 w-12.5 px-1 flex items-center justify-center font-extrabold rounded-lg">
                            <FaComment />{" "}
                            <span className="ml-2">
                                {post.comment_count ?? 0}
                            </span>
                        </span>
                    </div>
                </div>
            </Link>
        </div>
    );
};
