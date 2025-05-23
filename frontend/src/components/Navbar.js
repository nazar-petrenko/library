import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import AuthContext from '../context/AuthContext';

const AppNavbar = () => {
  const { isAuthenticated, isAdmin, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar
      expand="lg"
      className="shadow-sm mb-4 rounded-2"
      style={{
        background: 'linear-gradient(to right, #f5f7fa, #c3cfe2)',
        borderBottom: '1px solid #d6d6d6',
      }}
    >
      <Container>
        <Navbar.Brand
          as={Link}
          to="/"
          className="fw-bold fs-4 text-primary d-flex align-items-center gap-2"
        >
          📚 My Library
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/books" className="text-dark">
              Бібліотека
            </Nav.Link>
            {isAuthenticated && (
              <Nav.Link as={Link} to="/my-library" className="text-dark">
                Моя бібліотека
              </Nav.Link>
            )}
            {isAuthenticated && (
              <Nav.Link as={Link} to="/dashboard" className="text-dark">
                Кабінет
              </Nav.Link>
            )}
            {isAdmin && (
              <>
                <Nav.Link as={Link} to="/admin/panel" className="text-dark">
                  Адмін панель
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/search-add-book" className="text-dark">
                  ➕ Додати книгу
                </Nav.Link>
              </>
            )}
          </Nav>

          <Nav className="ms-auto align-items-center">
            {!isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/login" className="text-dark">
                  Увійти
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className="text-dark">
                  Реєстрація
                </Nav.Link>
              </>
            ) : (
              <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                Вийти
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
