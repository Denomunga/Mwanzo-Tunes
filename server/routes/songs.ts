import { Router } from "express";

const router = Router();

type Song = {
  id: string;
  title: string;
  artist: string;
  url: string;
};

// Mock data (replace with DB later).
const songs: Song[] = [
  {
    id: "1",
    title: "Song One",
    artist: "Artist A",
    url: "/songs/song1.mp3",
  },
  {
    id: "2",
    title: "Song Two",
    artist: "Artist B",
    url: "/songs/song2.mp3",
  },
];

router.get("/", async (_req, res) => {
  try {
    // If songs is null/undefined, fallback to []
    res.json(songs ?? []);
  } catch (err) {
    console.error("Error fetching songs:", err);
    res.status(500).json({ error: "Failed to fetch songs" });
  }
});

export default router;
