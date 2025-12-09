import express from "express";
import Advertisement from "../models/advertisementModel.js";

const router = express.Router();

// Mock ads
router.get("/mock", (req, res) => {
  const advertisements = [

    {
      _id: "4",
      title: "We need tutors for the upcoming Winter Semester. Apply Now!",
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_NIJfcO0Sjer-jcooNNtBZco6ikmojHZEpQ&s",
      link: "https://wwwmatthes.in.tum.de/pages/c9ulr7t9nrqs/Advanced-Topics-of-Software-Engineering"
    },
    {
      _id: "1",
      title: "Built to last because it’s designed to be updated",
      imageUrl: "https://www.gosee.news/prev/616x616/images/content3/fs21-google-pixel6-ramon-haindl-4.jpg",
      link: "https://store.google.com/de/category/phones?hl=de"
    },
    {
      _id: "2",
      title: "Applications for this year will open in early Fall",
      imageUrl: "https://pbs.twimg.com/profile_images/1197585028814905345/Dbq7RKDh_400x400.jpg",
      link: "https://hack.tum.de"
    },
    {
      _id: "3",
      title: "Join Europe's top Blockchain Conference in Munich! Explore web3 with experts and discover real-world applications",
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSwAPxCc_-iKcybANmhak8xFzJZwXmAROiCQ&s",
      link: "https://www.eventbrite.de/e/tum-blockchain-conference-24-tickets-922315539607?aff=oddtdtcreator"
    },

  ];
  res.json({ advertisements });
});

// Get all ads
router.get("/", async (req, res) => {
  try {
    const advertisements = await Advertisement.find();
    res.json({ advertisements });
  } catch (error) {
    res.status(500).json({ message: "Error fetching advertisements" });
  }
});

export default router;
