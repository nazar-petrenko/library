import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import ProtectedRoute from './routes/ProtectedRoute';
import AppNavbar from './components/Navbar';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Library from './pages/Library';
import BookDetails from './pages/BookDetails';
import MyLibrary from './pages/MyLibrary';
import Dashboard from './pages/UserDashboard';
import AddBook from './pages/AddBook';
import AdminDashboard from './pages/AdminDashboard';
import SearchResults from './pages/SearchResults';
import NotFound from './pages/NotFound';
import SearchAndAddBook from './pages/SearchAndAddBook';
import AdminUsersPage from './pages/AdminUsersPage';
import EditBook from './pages/EditBook';
import ReadBook from './pages/ReadBook';


function App() {
  return (
    <Router>
      <div className="App container py-3">
        <AppNavbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/books" element={<Library />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/book/:id" element={<BookDetails />} />
          <Route path="/read/:id" element={<ReadBook />} />
          <Route path="/my-library" element={    
            <ProtectedRoute>
              <MyLibrary />
            </ProtectedRoute>} />

          <Route path="/dashboard" element={    
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>} />
          
          <Route path="/admin/add-book" element={
            <ProtectedRoute requireAdmin={true}>
              <AddBook />
            </ProtectedRoute>} />
          
          <Route path="/admin/panel" element={<ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>} />

            <Route path="/users" element={<ProtectedRoute requireAdmin={true}>
              <AdminUsersPage />
            </ProtectedRoute>} />

          <Route path="/admin/search-add-book" element={<ProtectedRoute requireAdmin={true}>
              <SearchAndAddBook />
            </ProtectedRoute>} />
          
          <Route path="/admin/edit-book/:id" element={
            <ProtectedRoute requireAdmin={true}>
              <EditBook />
            </ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;