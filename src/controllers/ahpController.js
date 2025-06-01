const dataModel = require('../models/dataModel');

let alternatifNilai = {};  // Simpan nilai input user

// Halaman utama
exports.showHome = (req, res) => {
  res.render('home', { kriteria: dataModel.kriteria });
};

// Form input nilai alternatif
exports.showInputForm = (req, res) => {
  res.render('inputAlternatif', { 
    kriteria: dataModel.kriteria, 
    alternatif: dataModel.alternatif,
    inputNilai: alternatifNilai
  });
};

// Proses input nilai dari form
exports.processInput = (req, res) => {
  // req.body berbentuk: { "AlternatifA_Kepatuhan": "3", "AlternatifA_Hasil Kerja": "5", ... }
  // Simpan ke alternatifNilai
  alternatifNilai = {};
  for (const alt of dataModel.alternatif) {
    alternatifNilai[alt] = {};
    for (const kri of dataModel.kriteria) {
      const key = `${alt}_${kri}`;
      const val = parseFloat(req.body[key]);
      alternatifNilai[alt][kri] = val || 0;
    }
  }
  res.redirect('/matrix');
};

// Tampilkan matrix perbandingan (contoh sederhana: perbandingan bobot kriteria)
exports.showMatrix = (req, res) => {
  // Contoh perbandingan berpasangan antar kriteria (1-9 scale)
  // Buat matrix perbandingan berdasarkan bobot nilai rata-rata alternatif tiap kriteria

  // Hitung bobot kriteria (contoh bobot rata-rata)
  const kriteria = dataModel.kriteria;
  const alternatif = dataModel.alternatif;
  let bobotKriteria = {};
  for (const kri of kriteria) {
    let total = 0;
    for (const alt of alternatif) {
      total += alternatifNilai[alt]?.[kri] || 0;
    }
    bobotKriteria[kri] = total / alternatif.length || 0;
  }

  // Normalisasi bobot
  const totalBobot = Object.values(bobotKriteria).reduce((a,b) => a+b, 0);
  for (const kri of kriteria) {
    bobotKriteria[kri] = bobotKriteria[kri] / totalBobot;
  }

  res.render('matrixPerbandingan', { kriteria, bobotKriteria });
};

// Tampilkan hasil perhitungan akhir (ranking alternatif)
exports.showResults = (req, res) => {
  const kriteria = dataModel.kriteria;
  const alternatif = dataModel.alternatif;

  // Hitung bobot kriteria (sama seperti matrix)
  let bobotKriteria = {};
  for (const kri of kriteria) {
    let total = 0;
    for (const alt of alternatif) {
      total += alternatifNilai[alt]?.[kri] || 0;
    }
    bobotKriteria[kri] = total / alternatif.length || 0;
  }
  const totalBobot = Object.values(bobotKriteria).reduce((a,b) => a+b, 0);
  for (const kri of kriteria) {
    bobotKriteria[kri] = bobotKriteria[kri] / totalBobot;
  }

  // Hitung nilai akhir tiap alternatif = Σ (nilai alternatif di kriteria * bobot kriteria)
  let hasilAlternatif = [];
  for (const alt of alternatif) {
    let nilaiAkhir = 0;
    for (const kri of kriteria) {
      nilaiAkhir += (alternatifNilai[alt]?.[kri] || 0) * bobotKriteria[kri];
    }
    hasilAlternatif.push({ alternatif: alt, nilai: nilaiAkhir });
  }

  // Urutkan dari nilai terbesar
  hasilAlternatif.sort((a,b) => b.nilai - a.nilai);

  res.render('hasilPerhitungan', { hasilAlternatif, bobotKriteria });
};
