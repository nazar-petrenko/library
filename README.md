# Online Library Prototype

This is a prototype of an online library system featuring two roles: **Admin** and **User**.

## Features

### For Admin:
- Add books to the library manually.
- Import books via the Project Gutenberg API.
- Edit book details (title, author, description, cover, genres).
- Manage users (view and update roles).
- Manage genres and book categories.

### For User:
- Browse and search for books in the library.
- View detailed book information.
- Read books online.
- Add books to a personal library (wishlist, reading, finished).
- Track reading progress.
- Leave ratings and reviews.

---

## Technology Stack

### Frontend:
- React 18
- React Router DOM
- Bootstrap 5 + React Bootstrap
- Axios
- React Toastify

### Backend:
- Node.js
- Express.js
- SQLite (better-sqlite3)
- JWT authentication
- Multer (file uploads)
- Axios (external API requests)

---

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/your-repo.git
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd backend
npm install
```

4. Create a `.env` file in `backend` with the following:
```
PORT=5000
JWT_SECRET=your_jwt_secret
```

5. Run the backend:
```bash
cd backend
npm start
```

6. Run the frontend:
```bash
cd frontend
npm start
```

---

## Database Structure

The SQLite database includes:
- **users** – stores user accounts and roles.
- **books** – stores books with metadata.
- **genres** – list of available genres.
- **book_genres** – links books to genres.
- **book_files** – stores available file formats for each book.
- **reading_progress** – tracks user reading progress.
- **reviews** – stores user reviews and ratings.
- **user_books** – stores a user's saved books and statuses.

The system automatically creates an **admin** account:
```
username: admin
password: admin
email: admin@example.com
```

---

## License

MIT License

Copyright (c) 2025 Nazar Petrenko

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

