import express from 'express';
const router = express.Router();

import db from '../config/dynamoDB.js';

router.get('/', async (req, res) => {
    const data = await db.getFormData();

    res.render('index', { data });
    });

export default router;