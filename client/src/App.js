import { Route, Routes } from "react-router-dom";
import CreatePost from "../src/pages/CreatePost";
import EditPost from "../src/pages/EditPost";
import HomePage from "../src/pages/HomePage";
import LoginPage from "../src/pages/LoginPage";
import PostPage from "../src/pages/PostPage";
import RegisterPage from "../src/pages/RegisterPage";
import './App.css';
import Layout from "./Component/Layout";
import { UserContextProvider } from "./Component/UserContext";

function App() {
  return (
    <UserContextProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/post/:id" element={<PostPage />} />
          <Route path="/edit/:id" element={<EditPost />} />
        </Route>
      </Routes>
    </UserContextProvider>
  );
}

export default App;