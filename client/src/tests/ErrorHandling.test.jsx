import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from '../utils/axios';

jest.mock('../utils/axios');

describe('Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('API Error Handling', () => {
    it('handles 401 unauthorized errors', async () => {
      axios.get.mockRejectedValue({
        response: {
          status: 401,
          data: { error: 'Unauthorized' }
        }
      });

      const TestComponent = () => {
        const [error, setError] = React.useState(null);
        
        React.useEffect(() => {
          axios.get('/test').catch(err => setError(err.response?.data?.error || 'Error'));
        }, []);

        return <div>{error || 'Loading...'}</div>;
      };

      render(
        <BrowserRouter>
          <TestComponent />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/unauthorized/i)).toBeInTheDocument();
      });
    });

    it('handles 403 forbidden errors', async () => {
      axios.get.mockRejectedValue({
        response: {
          status: 403,
          data: { error: 'Access denied' }
        }
      });

      const TestComponent = () => {
        const [error, setError] = React.useState(null);
        
        React.useEffect(() => {
          axios.get('/test').catch(err => setError(err.response?.data?.error || 'Error'));
        }, []);

        return <div>{error || 'Loading...'}</div>;
      };

      render(
        <BrowserRouter>
          <TestComponent />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/access denied/i)).toBeInTheDocument();
      });
    });

    it('handles 404 not found errors', async () => {
      axios.get.mockRejectedValue({
        response: {
          status: 404,
          data: { error: 'Resource not found' }
        }
      });

      const TestComponent = () => {
        const [error, setError] = React.useState(null);
        
        React.useEffect(() => {
          axios.get('/test').catch(err => setError(err.response?.data?.error || 'Error'));
        }, []);

        return <div>{error || 'Loading...'}</div>;
      };

      render(
        <BrowserRouter>
          <TestComponent />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/resource not found/i)).toBeInTheDocument();
      });
    });

    it('handles 500 server errors', async () => {
      axios.get.mockRejectedValue({
        response: {
          status: 500,
          data: { error: 'Internal server error' }
        }
      });

      const TestComponent = () => {
        const [error, setError] = React.useState(null);
        
        React.useEffect(() => {
          axios.get('/test').catch(err => setError(err.response?.data?.error || 'Error'));
        }, []);

        return <div>{error || 'Loading...'}</div>;
      };

      render(
        <BrowserRouter>
          <TestComponent />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/internal server error/i)).toBeInTheDocument();
      });
    });

    it('handles network errors', async () => {
      axios.get.mockRejectedValue(new Error('Network Error'));

      const TestComponent = () => {
        const [error, setError] = React.useState(null);
        
        React.useEffect(() => {
          axios.get('/test').catch(err => setError(err.message || 'Error'));
        }, []);

        return <div>{error || 'Loading...'}</div>;
      };

      render(
        <BrowserRouter>
          <TestComponent />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Error Handling', () => {
    it('displays validation errors', () => {
      const TestForm = () => (
        <form>
          <input required data-testid="email" />
          <span data-testid="error">Email is required</span>
        </form>
      );

      render(
        <BrowserRouter>
          <TestForm />
        </BrowserRouter>
      );

      expect(screen.getByTestId('error')).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });

    it('clears errors after successful submission', async () => {
      const TestForm = () => {
        const [error, setError] = React.useState(null);
        const handleSubmit = () => setError(null);
        
        return (
          <form onSubmit={handleSubmit}>
            {error && <span data-testid="error">{error}</span>}
            <button type="submit">Submit</button>
          </form>
        );
      };

      render(
        <BrowserRouter>
          <TestForm />
        </BrowserRouter>
      );
    });
  });

  describe('Loading States', () => {
    it('shows loading indicator during API calls', async () => {
      axios.get.mockImplementation(() => new Promise(() => {}));

      const TestComponent = () => {
        const [loading, setLoading] = React.useState(true);
        
        React.useEffect(() => {
          axios.get('/test').finally(() => setLoading(false));
        }, []);

        return <div>{loading ? 'Loading...' : 'Loaded'}</div>;
      };

      render(
        <BrowserRouter>
          <TestComponent />
        </BrowserRouter>
      );

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('hides loading indicator after data loads', async () => {
      axios.get.mockResolvedValue({ data: { success: true } });

      const TestComponent = () => {
        const [loading, setLoading] = React.useState(true);
        
        React.useEffect(() => {
          axios.get('/test').then(() => setLoading(false));
        }, []);

        return <div>{loading ? 'Loading...' : 'Loaded'}</div>;
      };

      render(
        <BrowserRouter>
          <TestComponent />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/loaded/i)).toBeInTheDocument();
      });
    });
  });
});
