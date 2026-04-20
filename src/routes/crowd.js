import express from "express";
import axios from "axios"
const PYTHON_URL = "https://smog-baboon-gloomily.ngrok-free.dev";
const router = express.Router();

router.get("/crowd1", async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_URL}/data1`);

    res.json(response.data); // forward Python response

  } catch (error) {
    console.error("Error calling Python API:", error.message);
    res.status(500).json({ error: "Python service failed" });
  }
});

router.get("/crowd2", async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_URL}/data2`);

    res.json(response.data); // forward Python response

  } catch (error) {
    console.error("Error calling Python API:", error.message);
    res.status(500).json({ error: "Python service failed" });
  }
});
router.get("/crowd3", async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_URL}/data3`);

    res.json(response.data); // forward Python response

  } catch (error) {
    console.error("Error calling Python API:", error.message);
    res.status(500).json({ error: "Python service failed" });
  }
});

router.get("/crowd4", async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_URL}/data4`);

    res.json(response.data);

  } catch (error) {
    console.error("Error calling Python API:", error.message);
    res.status(500).json({ error: "Python service failed" });
  }
});
export default router;