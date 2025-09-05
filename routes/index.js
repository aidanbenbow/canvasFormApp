import express from 'express';
const router = express.Router();

import db from '../config/dynamoDB.js';

router.get('/', async (req, res) => {
    const mode = req.query?.mode || 'default';
    const data = await db.getFormData();
     console.log('Fetched form data:', data);
    res.render('index', { forms: data });
    });

    router.get('/forms', async (req, res) => {
        const { mode } = req.query; // 'edit' or 'fill'
        const data = await db.getFormData(); // Fetch all forms from DynamoDB
      
        res.render('index', { forms: data }); // Pass mode to the view
      });

export default router;