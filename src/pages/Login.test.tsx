import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';

describe('Login Page', () => {
  it('should render the login form correctly', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // Verificar que el t�tulo principal est� presente
    expect(screen.getByRole('heading', { name: /Bienvenido a INFORiA/i })).toBeInTheDocument();
    
    // Verificar que el bot�n para iniciar sesi�n con Google existe
    expect(screen.getByRole('button', { name: /Iniciar sesi�n con Google/i })).toBeInTheDocument();
  });
});
