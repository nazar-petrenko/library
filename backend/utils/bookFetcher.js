// backend/utils/bookFetcher.js
const axios = require('axios');

// Шукає книгу в Open Library
async function searchOpenLibrary(query) {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5`;
  const response = await axios.get(url);

  const results = response.data.docs.map((doc) => ({
    title: doc.title,
    author: doc.author_name?.[0] || 'Unknown',
    openlibrary_id: doc.key?.split('/')?.[2] || null,
    cover_url: doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
      : null,
    isbn: doc.isbn?.[0] || null,
    year: doc.first_publish_year || null
  }));

  return results;
}

// Шукає, чи є книга в Gutenberg (дуже спрощено)
async function searchGutenberg(title) {
  const url = `https://gutendex.com/books/?search=${encodeURIComponent(title)}`;
  const response = await axios.get(url);

  if (response.data.results.length === 0) return null;

  const match = response.data.results[0];
  return {
    gutenberg_id: match.id,
    formats: match.formats,
    text_url:
      match.formats['text/plain; charset=utf-8'] ||
      match.formats['text/plain'] ||
      null
  };
}

module.exports = {
  searchOpenLibrary,
  searchGutenberg
};