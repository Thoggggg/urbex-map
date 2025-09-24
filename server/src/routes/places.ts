import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import sanitizeHtml from 'sanitize-html';
import { upload } from '../multer.config'; // Import our new multer config

const router = Router();
const prisma = new PrismaClient();

const getTodayDateString = () => new Date().toISOString().split('T')[0];
const PORT = process.env.PORT || 3001;

// --- Route Definitions for /api/places ---

/**
 * GET /
 * Fetches all places, ordered by most recently created.
 */
router.get('/', async (req, res) => {
  try {
    const places = await prisma.place.findMany({ orderBy: { id: 'desc' } });
    res.status(200).json(places);
  } catch (error) {
    console.error("Failed to fetch places:", error);
    res.status(500).json({ error: 'Failed to fetch places' });
  }
});

/**
 * POST /
 * Creates a new place.
 */
router.post('/', async (req, res) => {
  try {
    const { name, description, location, status } = req.body;
    if (!name || !location || !location.lat || !location.lng || !status) {
      return res.status(400).json({ error: 'Missing required fields.' });
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

/**
 * PUT /:id/status
 * A dedicated route to quickly update only the status of a place.
 */
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { newStatus } = req.body;
  try {
    const placeToUpdate = await prisma.place.findUnique({ where: { id: Number(id) } });
    if (!placeToUpdate) return res.status(404).json({ error: 'Place not found' });
    
    const updateData: any = { status: newStatus };
    if (newStatus === 'visited') {
      updateData.imageUrl = `https://picsum.photos/seed/${id}/400/300`;
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

/**
 * PUT /:id
 * Updates all details of a place, and handles an optional file upload.
 */
router.put('/:id', upload.single('picture'), async (req, res) => {
  const { id } = req.params;
  const { name, description, status, visitedDate, location } = req.body;

  const validStatuses = ['visited', 'suggestion', 'inaccessible'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status.' });
  if (typeof name !== 'string' || name.length > 255) return res.status(400).json({ error: 'Invalid name.' });

  const cleanName = sanitizeHtml(name, { allowedTags: [], allowedAttributes: {} });
  const cleanDescription = sanitizeHtml(description, { allowedTags: [], allowedAttributes: {} });

  try {
    const updateData: any = {
      name: cleanName,
      description: cleanDescription,
      status,
      visitedDate: status === 'visited' ? (visitedDate || getTodayDateString()) : null,
    };

    if (location && location.lat && location.lng) {
      updateData.lat = parseFloat(location.lat);
      updateData.lng = parseFloat(location.lng);
    }
    
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
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

/**
 * DELETE /:id
 * Deletes a place from the database.
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.place.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    console.error(`Failed to delete place ${id}:`, error);
    res.status(500).json({ error: 'Failed to delete place' });
  }
});

export default router;