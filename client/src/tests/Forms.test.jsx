import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

describe('Form Components', () => {
  describe('Input validation', () => {
    it('validates required fields', () => {
      const TestForm = () => (
        <form>
          <input required data-testid="required-field" />
          <button type="submit">Submit</button>
        </form>
      );

      render(
        <BrowserRouter>
          <TestForm />
        </BrowserRouter>
      );

      const button = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(button);

      const input = screen.getByTestId('required-field');
      expect(input).toBeInvalid();
    });

    it('validates email format', () => {
      const TestForm = () => (
        <form>
          <input type="email" data-testid="email-field" />
        </form>
      );

      render(
        <BrowserRouter>
          <TestForm />
        </BrowserRouter>
      );

      const input = screen.getByTestId('email-field');
      fireEvent.change(input, { target: { value: 'invalid-email' } });
      fireEvent.blur(input);

      expect(input).toBeInvalid();
    });

    it('accepts valid email', () => {
      const TestForm = () => (
        <form>
          <input type="email" data-testid="email-field" />
        </form>
      );

      render(
        <BrowserRouter>
          <TestForm />
        </BrowserRouter>
      );

      const input = screen.getByTestId('email-field');
      fireEvent.change(input, { target: { value: 'valid@example.com' } });
      fireEvent.blur(input);

      expect(input).toBeValid();
    });

    it('validates password length', () => {
      const TestForm = () => (
        <form>
          <input type="password" minLength={8} data-testid="password-field" />
        </form>
      );

      render(
        <BrowserRouter>
          <TestForm />
        </BrowserRouter>
      );

      const input = screen.getByTestId('password-field');
      fireEvent.change(input, { target: { value: 'short' } });
      fireEvent.blur(input);

      expect(input).toBeInvalid();
    });

    it('accepts valid password', () => {
      const TestForm = () => (
        <form>
          <input type="password" minLength={8} data-testid="password-field" />
        </form>
      );

      render(
        <BrowserRouter>
          <TestForm />
        </BrowserRouter>
      );

      const input = screen.getByTestId('password-field');
      fireEvent.change(input, { target: { value: 'ValidPassword123' } });
      fireEvent.blur(input);

      expect(input).toBeValid();
    });
  });

  describe('Form submission', () => {
    it('submits form with valid data', async () => {
      const handleSubmit = jest.fn();
      const TestForm = () => (
        <form onSubmit={handleSubmit}>
          <input name="email" data-testid="email-field" />
          <input name="password" data-testid="password-field" />
          <button type="submit">Submit</button>
        </form>
      );

      render(
        <BrowserRouter>
          <TestForm />
        </BrowserRouter>
      );

      const emailInput = screen.getByTestId('email-field');
      const passwordInput = screen.getByTestId('password-field');
      const button = screen.getByRole('button', { name: /submit/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(button);

      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('prevents submission with invalid data', async () => {
      const handleSubmit = jest.fn();
      const TestForm = () => (
        <form onSubmit={handleSubmit}>
          <input required name="email" data-testid="email-field" />
          <button type="submit">Submit</button>
        </form>
      );

      render(
        <BrowserRouter>
          <TestForm />
        </BrowserRouter>
      );

      const button = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(button);

      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Form reset', () => {
    it('resets form fields', () => {
      const TestForm = () => (
        <form data-testid="test-form">
          <input name="email" defaultValue="test@example.com" data-testid="email-field" />
          <input name="password" defaultValue="password123" data-testid="password-field" />
          <button type="reset">Reset</button>
        </form>
      );

      render(
        <BrowserRouter>
          <TestForm />
        </BrowserRouter>
      );

      const emailInput = screen.getByTestId('email-field');
      const resetButton = screen.getByRole('button', { name: /reset/i });

      expect(emailInput.value).toBe('test@example.com');
      fireEvent.click(resetButton);
      expect(emailInput.value).toBe('');
    });
  });
});
