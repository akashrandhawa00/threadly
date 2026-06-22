import { Route, Routes } from "react-router";
import { Home } from "./pages/Home";
import Navbar from "./components/Navbar";
import { CreatePostPage } from "./pages/CreatePostPage";
import { PostPage } from "./pages/PostPage";
import { CreateCommunityPage } from "./pages/CreateCommunityPage";
import { CommunitiesPage } from "./pages/CommunitiesPage";

function App() {
    return (
        <div className="min-h-screen bg-black text-gray-100 transition-opacity duration-700 pt-20 bg-[radial-gradient(circle,#1e232b_1px,transparent_1px)] bg-size-[25px_25px]">
            <Navbar />
            <div className="container mx-auto px-4 py-6 ">
                <Routes>
                    <Route path="/" element={<Home />}></Route>
                    <Route path="/create" element={<CreatePostPage />}></Route>
                    <Route path="/post/:id" element={<PostPage />}></Route>
                    <Route
                        path="/communities"
                        element={<CommunitiesPage />}
                    ></Route>
                    <Route
                        path="/community/create"
                        element={<CreateCommunityPage />}
                    ></Route>
                </Routes>
            </div>
        </div>
    );
}

export default App;
