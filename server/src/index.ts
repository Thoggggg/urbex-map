import express from 'express';
import cors from 'cors';
import path from 'path';
import placesRouter from './routes/places'; // Import the new router

const app = express();
const PORT = process.env.PORT || 3001;

// --- Global Middlewares ---
app.use(cors());
app.use(express.json());

/**
 * Serve the 'uploads' directory from the project root as a static folder.
 * This makes images available at URLs like http://localhost:3001/uploads/filename.jpg
 */
const uploadsDir = path.join(__dirname, '../../uploads');
app.use('/uploads', express.static(uploadsDir));

// --- API Routes ---
// All routes starting with /api/places will be handled by our placesRouter.
app.use('/api/places', placesRouter);

// --- Server Startup ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});