import express from 'express';
import cors from 'cors';
import path from 'path';
import placesRouter from './routes/places'; // Import the new router

const app = express();
const PORT = process.env.PORT || 3001;

// --- Global Middlewares ---
app.use(cors());
app.use(express.json());

// Serve the 'uploads' directory as a static folder.
const uploadsDir = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// --- API Routes ---
app.use('/api/places', placesRouter);

// --- Server Startup ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});