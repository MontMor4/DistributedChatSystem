import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoginForm } from './LoginForm';
import React from 'react';

describe('LoginForm', () => {
  it('renders login form correctly', () => {
    render(<LoginForm />);

    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('calls onSubmitForm when form is submitted', () => {
    const handleSubmit = vi.fn((e) => e.preventDefault());
    render(<LoginForm onSubmitForm={handleSubmit} />);

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    fireEvent.click(submitButton);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});
