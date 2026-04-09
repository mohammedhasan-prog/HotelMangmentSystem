import { Link } from 'react-router-dom';
import { Button } from '@mui/material';

function NotFoundPage() {
  return (
    <div className="stack-lg narrow">
      <h1>Page Not Found</h1>
      <p>The page you requested does not exist.</p>
      <Button component={Link} to="/" variant="contained" color="primary">Go Home</Button>
    </div>
  );
}

export default NotFoundPage;
