import { app } from './index.js';

const port = 3000;

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});