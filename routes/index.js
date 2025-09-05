import express from 'express';
const router = express.Router();

import db from '../config/dynamoDB.js';

router.get('/', async (req, res) => {
    const mode = admin
    const data = [{"id":"3e9298fe-1feb-4249-b024-e007fd59b68f","formStructure":[{"color":"lightblue","size":{"width":74.03160095214844,"height":41.599999999999994},"imageKey":null,"actionKey":null,"label":"label","text":"name","type":"textBox","startPosition":{"x":10,"y":40}},{"color":"lightgreen","size":{"width":200,"height":50},"imageKey":null,"actionKey":"writeText","label":"label","text":"","type":"inputBox","startPosition":{"x":-1,"y":85}},{"color":"lightcoral","size":{"width":200,"height":50},"imageKey":"button-unpushed","actionKey":"sendButton","label":"label","text":"","type":"imageBox","startPosition":{"x":15,"y":156}}],"label":"name"},{"id":"40d83262-3d3f-461c-ba7d-7b94049ac537","formStructure":[{"size":{"width":54.82574462890625,"height":41.599999999999994},"color":"lightblue","imageKey":null,"actionKey":null,"text":"info","label":"label","type":"textBox","startPosition":{"x":10,"y":40}},{"size":{"width":200,"height":50},"color":"lightgreen","imageKey":null,"actionKey":null,"text":"","label":"label","type":"inputBox","startPosition":{"x":9,"y":91}},{"size":{"width":200,"height":50},"color":"lightcoral","imageKey":"button-unpushed","actionKey":"sendButton","text":"","label":"label","type":"imageBox","startPosition":{"x":10,"y":147}}],"label":"info"}]
    fill
     console.log('Fetched form data:', data);
    res.render('index', {  mode });
    });

    router.get('/forms', async (req, res) => {
        // const { mode } = req.query; // 'edit' or 'fill'
        // const data = await db.getFormData(); // Fetch all forms from DynamoDB
      
        res.render('test'); // Pass mode to the view
      });

export default router;