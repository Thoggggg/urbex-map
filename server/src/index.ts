import express from 'express';
import path from 'path';
import placesRouter from './routes/places';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// --- Static File Serving ---
const clientBuildPath = path.join(__dirname, './public');
app.use(express.static(clientBuildPath));

// We use a simple, absolute path for reliability.
const uploadsPath = '/app/uploads';
app.use('/uploads', express.static(uploadsPath));


// --- API Routes ---
app.use('/api/places', placesRouter);


// --- SPA Fallback ---
// This must come *after* all other routes.
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});


// --- Server Startup ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});