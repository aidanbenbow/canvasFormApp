import express from 'express';
const router = express.Router();

import db from '../config/dynamoDB.js';

router.get('/', async (req, res) => {
    const data = await db.getFormData();
     
    res.render('index', {data });
    });



    router.post('/message', async (req, res) => {
      const { formId, inputs } = req.body;
    console.log('Received message data:', req.body);
    if (!formId || typeof inputs !== 'object' || Array.isArray(inputs)) {
      return res.status(400).json({ error: 'Invalid payload. Expected formId and inputs object.' });
    }
  
      try {
        const result = await db.saveMessage(formId, inputs);
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });



    router.post('/saveFormStructure', async (req, res) => {
        const { id, formStructure, label, resultsTable } = req.body;
        if (!id || !formStructure) {
          return res.status(400).json({ error: 'Missing id or formStructure' });
        }
      
        try {
          await db.updateFormData(id, formStructure, label, resultsTable);
          res.json({ success: true });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      
    });


export default router;