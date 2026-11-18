import express from 'express';
const app = express();
app.use(express.static('dist'));
app.get('*', (_, r) => r.sendFile(process.cwd() + '/dist/index.html'));
app.listen(process.env.PORT || 3000);
