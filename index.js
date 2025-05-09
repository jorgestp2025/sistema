
require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const jsPDF = require('jspdf');
require('jspdf-autotable');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post('/api/enviar-reporte', async (req, res) => {
  const { correo, registros } = req.body;

  try {
    const doc = new jsPDF();
    doc.autoTable({
      head: [["Fecha", "Efectivo", "Cheque", "Crédito", "Transf. 1", "Crédito 2", "Transf. 2", "Gastos"]],
      body: registros.map(r => [
        r.fecha,
        r.efectivo,
        r.cheque,
        r.credito,
        r.transferencia1,
        r.credito2,
        r.transferencia2,
        r.gastos,
      ]),
    });

    const pdfPath = './reporte.pdf';
    doc.save(pdfPath);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: correo,
      subject: 'Reporte de Ingresos y Gastos',
      text: 'Adjunto encontrarás el reporte solicitado.',
      attachments: [{ filename: 'reporte.pdf', path: pdfPath }],
    });

    res.send({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'No se pudo enviar el correo' });
  }
});

app.listen(3001, () => {
  console.log('Servidor backend corriendo en http://localhost:3001');
});
