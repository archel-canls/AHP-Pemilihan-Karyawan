const express = require('express');
const router = express.Router();
const ahpController = require('../controllers/ahpController');

// Halaman utama - form input alternatif
router.get('/', ahpController.showHome);

// Form input nilai alternatif per kriteria
router.get('/input', ahpController.showInputForm);
router.post('/input', ahpController.processInput);

// Tampilkan matrix perbandingan
router.get('/matrix', ahpController.showMatrix);

// Tampilkan hasil perhitungan
router.get('/hasil', ahpController.showResults);

module.exports = router;
