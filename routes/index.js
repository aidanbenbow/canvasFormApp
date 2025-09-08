import express from 'express';
const router = express.Router();

import db from '../config/dynamoDB.js';

router.get('/', async (req, res) => {
 
    const data = await db.getFormData();
    
     console.log('Fetched form data:', data);
     
    res.render('index', {data });
    });

    router.post('/messages', async (req, res) => {
        const { id, message, label } = req.body;

        try {
          const result = await db.saveMessage(id, message, label);
          res.json({ success: true, result });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      
    });


export default router;