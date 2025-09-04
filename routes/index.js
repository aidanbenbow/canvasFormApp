import express from 'express';
const router = express.Router();

import db from '../config/dynamoDB.js';

router.get('/', async (req, res) => {
    const data = await db.getFormData();

    res.render('index', { data });
    });

    router.get('/forms', async (req, res) => {
        const { mode } = req.query; // 'edit' or 'fill'
        const data = await db.getFormData(); // Fetch all forms from DynamoDB
      
        res.render('index', { forms: data, mode }); // Pass mode to the view
      });

export default router;