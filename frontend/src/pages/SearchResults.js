// src/pages/SearchResults.js
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchResults = () => {
  const query = useQuery();
  const searchTerm = query.get('q') || '';
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (searchTerm) {
      axios.get(`/api/books/search?q=${searchTerm}`)
        .then(res => setResults(res.data))
        .catch(err => console.error(err));
    }
  }, [searchTerm]);

  return (
    <div>
      <h2>Результати пошуку: "{searchTerm}"</h2>
      <div className="row">
        {results.length === 0 ? (
          <p>Нічого не знайдено.</p>
        ) : (
          results.map((book, index) => (
            <div key={index} className="col-md-4 mb-3">
              <div className="card h-100">
                <img src={book.cover_url} className="card-img-top" alt={book.title} />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{book.title}</h5>
                  <p className="card-text">{book.author}</p>
                  <Link to={`/book/${book.id || book.externalId}`} className="btn btn-primary mt-auto">Деталі</Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchResults;
