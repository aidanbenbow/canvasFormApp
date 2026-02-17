import  express from "express";
const app = express();


import http from "http";
import { Server } from "socket.io";

import path from 'path';
import { fileURLToPath } from 'url';
import db from './config/dynamoDB.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://18.199.154.27", // ✅ Match frontend origin
    methods: ["GET", "POST"]
  }
});


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

io.on('connection', (socket) => {
 // console.log('A user connected:', socket.id);

 socket.on('getAllForms', async ({ user }) => {
  
    try {
      const forms = await db.getFormData(user);
   
     socket.emit('allFormsData', {user, forms });
    } catch (error) {
      console.error('Error fetching all forms:', error);
      socket.emit('allFormsData', { forms: [], error: error.message });
    }
  });

  socket.on('getFormById', async ({ formId }) => {
    console.log(`Fetching form by ID: ${formId}`);
    try {
      const formData = await db.getFormDataById(formId);
      socket.emit('formDataById', { formId, formData });
    } catch (error) {
      console.error('Error fetching form by ID:', error);
      socket.emit('formDataById', { formId, formData: null, error: error.message });
    }
  });

  socket.on('getArticleById', async ({ articleID }) => {
     
    console.log(`Fetching article by ID: ${articleID}`);
    try {
      const articleData = await db.getArticleById(articleID);
      socket.emit('articleDataById', { articleID, articleData });
    } catch (error) {
      console.error('Error fetching article by ID:', error);
      socket.emit('articleDataById', { articleID, articleData: null, error: error.message });
    }
  });

  socket.on('log', async ({ message, data }) => {
    console.log(`[LOG] ${message}`);
    console.log('Received data:', data);
 
    try {
      let result = null;
      const tableName = data?.resultsTable;
      const isBlogSubmit =
        (typeof tableName === 'string' && tableName.trim().toLowerCase() === 'dorcasusers') ||
        (typeof data?.formLabel === 'string' && data.formLabel.trim().toLowerCase() === 'blog');

      if (tableName === 'progressreports') {
        const fields = { ...(data?.fields || {}) };
        delete fields.done;
        const reportId = fields['input-name'] || fields.nameInput || fields.name;
        const parsedMessageYear = Number(
          data?.messageYear ?? fields.messageYear ?? fields.message_year ?? fields['message-year']
        );
        const messageYear = Number.isFinite(parsedMessageYear) ? parsedMessageYear : undefined;
        const updates = {
          message: fields.messageInput || fields.message || null,
          report: fields.reportInput || fields.report || null,
          messageYear
        };

        result = await db.updateProgressReport(reportId, updates);
      } else if (isBlogSubmit) {
        result = await db.createDorcasArticle({
          formId: data?.formId,
          user: data?.user,
          formLabel: data?.formLabel,
          formFields: data?.formFields,
          fields: data?.fields
        });
      } else {
        const rawResponses = data?.responses || data?.fields || {};
        const knownIds = new Set(
          Array.isArray(data?.formFields)
            ? data.formFields.map((field) => field?.id).filter(Boolean)
            : []
        );
        const responses = knownIds.size > 0
          ? Object.fromEntries(
              Object.entries(rawResponses).filter(([key]) => knownIds.has(key))
            )
          : rawResponses;
        result = await db.saveMessage(
          data.formId, data.user, responses
        );
      }
  
      socket.emit('messageResponse', { success: true, result });

    } catch (error) {
      console.error('Error saving log:', error);
      socket.emit('messageResponse', { success: false, error: error.message });
    }
  });
  
  socket.on('saveFormStructure', async (payload) => {
    const { id, formStructure, label, user } = payload;
 console.log('Saving form structure with payload:', payload);
    try {
      const result = await db.upsertFormData(id, formStructure, label, user);
      socket.emit('formSavedResponse', { success: true, result });
    } catch (error) {
      socket.emit('formSavedResponse', {
        success: false,
        error: error.message || 'Unknown error'
      });
    }
  });

  socket.on('deleteTheForm', async (payload) => {
   const {id} = payload;
  console.log('Deleting form with ID:', payload)
    try {
      const result = await db.deleteFormData(id);
      socket.emit('formDeletedResponse', { success: true, result });
    } catch (error) {
      socket.emit('formDeletedResponse', {
        success: false,
        error: error.message || 'Unknown error'
      });
    }
  });

  socket.on('loadFormStructure', async ({ formId }) => {
    try {
      const formData = await db.getFormDataById(formId);
      socket.emit('formStructureData', { formId, formData });
    } catch (error) {
      socket.emit('formStructureData', { formId, formData: null, error: error.message });
    }
  });

  socket.on('getFormResults', async ({ formId, tableName }) => {
    try {
      const results = await db.getFormResults(formId, tableName);
      console.log(`Fetched results for form ${formId} from table ${tableName}:`, results);
      socket.emit('formResultsData', { formId, results });
    } catch (err) {
      socket.emit('formResultsData', { formId, results: [], error: err.message });
    }
  
  });

  socket.on('getAllFormResults', async ({ tableName }) => {
    try {
      const results = await db.getAllFormResults(tableName);
      console.log(`Fetched all results for table ${tableName}:`, results);
      socket.emit('allFormResultsData', { tableName, results });
    } catch (err) {
      socket.emit('allFormResultsData', { tableName, results: [], error: err.message });
    }
  
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

//app.use('/', indexRoutes);

app.get('/', async (req, res) => {
const data = await db.getFormData();
  res.render('index', { data });
});



app.get('/form', (req, res) => {
  const formData = {
    id: '6a19c9c0-2984-4088-bf4e-06ae0ddb2516',
    title: 'Seara de Discutie',
    name: 'фамилия имя / nume prenume',
    ocupatie: 'Школа, колледж, университет, профессия / Școală, colegiul, universitate, ocupație.',
    good: 'что тебе понравилось в этом вечере? / ce ti-a placut la seara asta?',
    better: 'Что может быть лучше? / Ce ar putea fi mai bun?',
    learnt: 'Сегодня вечером Tы узнали одну вещь? / Un lucru pe care l-ai învățat în seara asta?',
  };
  res.render('form', { form: formData });
});

app.post('/submitted', async (req, res) => {
  // console.log('Form data received:', req.body);
    const formData = req.body;
   console.log('Form data received:', formData);

 
   // Save the form data to DynamoDB
    try {
        await db.saveMessage(formData.formId, formData);
        // Fetch updated results
    const updatedResults = await db.getFormResults(formData.formId, 'onequestion');

    // ✅ Emit to all connected clients
    io.emit('formResultsUpdated', {
      formId: formData.formId,
      results: updatedResults
    });
        res.redirect('/thankyou');
    } catch (error) {
        console.error('Error saving form data:', error);
        res.status(500).send('Error saving form data');
    }

});

app.get('/thankyou', (req, res) => {
  res.render('thankyou');
});

app.use(express.static('public'));
server.listen(4500, () => {
  console.log("Server is running on port 4500");
});