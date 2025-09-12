import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import sanitizeHtml from 'sanitize-html';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
const prisma = new PrismaClient();

// --- Setup Uploads Folder ---
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// --- Multer Configuration ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir); // Save files to the 'uploads' directory
  },
  filename: function (req, file, cb) {
    // Create a unique filename to prevent overwrites
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// [NEW] Serve the uploaded files statically
app.use('/uploads', express.static(uploadsDir));

const PORT = process.env.PORT || 3001;
const getTodayDateString = () => new Date().toISOString().split('T')[0];


// --- API ROUTES ---

// GET /api/places
app.get('/api/places', async (req, res) => {
  try {
    const places = await prisma.place.findMany({
      orderBy: { id: 'desc' },
    });
    res.status(200).json(places);
  } catch (error) {
    console.error("Failed to fetch places:", error);
    res.status(500).json({ error: 'Failed to fetch places' });
  }
});

// POST /api/places
app.post('/api/places', async (req, res) => {
  try {
    const { name, description, location, status } = req.body;
    if (!name || !location || !location.lat || !location.lng || !status) {
      return res.status(400).json({ error: 'Missing required fields for creating a place.' });
    }
    const newPlace = await prisma.place.create({
      data: { name, description, lat: location.lat, lng: location.lng, status },
    });
    res.status(201).json(newPlace);
  } catch (error) {
    console.error("Failed to create place:", error);
    res.status(500).json({ error: 'Failed to create place' });
  }
});

// PUT /api/places/:id/status
app.put('/api/places/:id/status', async (req, res) => {
  const { id } = req.params;
  const { newStatus } = req.body;
  try {
    const placeToUpdate = await prisma.place.findUnique({ where: { id: Number(id) } });
    if (!placeToUpdate) return res.status(404).json({ error: 'Place not found' });
    
    const updateData: any = { status: newStatus };
    if (newStatus === 'visited') {
      updateData.imageUrl = `https://picsum.photos/seed/${id}/400/300`;
      // [DATE FEATURE] Automatically set today's date
      updateData.visitedDate = getTodayDateString();
    } else {
      updateData.imageUrl = null;
      updateData.visitedDate = null;
    }
    const updatedPlace = await prisma.place.update({ where: { id: Number(id) }, data: updateData });
    res.status(200).json(updatedPlace);
  } catch (error) {
    console.error(`Failed to update status for place ${id}:`, error);
    res.status(500).json({ error: 'Failed to update place status' });
  }
});

// PUT /api/places/:id - Now handles file uploads
// The `upload.single('picture')` middleware will process the uploaded file.
app.put('/api/places/:id', upload.single('picture'), async (req, res) => {
  const { id } = req.params;
  const { name, description, status, visitedDate, location } = req.body;

  // Validation
  const validStatuses = ['visited', 'suggestion', 'inaccessible'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status.' });
  if (typeof name !== 'string' || name.length > 100) return res.status(400).json({ error: 'Invalid name.' });
  const cleanName = sanitizeHtml(name, { allowedTags: [], allowedAttributes: {} });
  const cleanDescription = sanitizeHtml(description, { allowedTags: [], allowedAttributes: {} });

  try {
    const placeToUpdate = await prisma.place.findUnique({ where: { id: Number(id) } });
    if (!placeToUpdate) return res.status(404).json({ error: 'Place not found' });
    
    const updateData: any = {
      name: cleanName,
      description: cleanDescription,
      status,
      visitedDate: status === 'visited' ? (visitedDate || getTodayDateString()) : null,
    };

    // [MOVE FEATURE] If new location coordinates are provided, add them to the update payload
    if (location && location.lat && location.lng) {
      updateData.lat = parseFloat(location.lat);
      updateData.lng = parseFloat(location.lng);
    }
    
    if (req.file) {
      updateData.imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    } else if (status !== 'visited') {
      updateData.imageUrl = null;
    }

    const updatedPlace = await prisma.place.update({ where: { id: Number(id) }, data: updateData });
    res.status(200).json(updatedPlace);
  } catch (error) {
    console.error(`Failed to update place ${id}:`, error);
    res.status(500).json({ error: 'Failed to update place' });
  }
});

// DELETE /api/places/:id
app.delete('/api/places/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.place.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    console.error(`Failed to delete place ${id}:`, error);
    res.status(500).json({ error: 'Failed to delete place' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});