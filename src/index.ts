
import { createClient } from 'redis';

let client: any;
try {
  client = await createClient()
  .on('error', err => console.log('Redis Client Error', err))
  .connect();
  console.log('connected redis!')
} catch (e) {
  console.error(e)
  process.exit(1)
}

import express from 'express';

const app = express();
const port = 3222;

app.use(express.json())

const SECRET = process.env.SHARED_SECRET || "secret"

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  console.log(authHeader)
  if (authHeader !== SECRET) {
      return res.status(401).send('Unauthorized');
  }
  next();
});

app.get('/', async (req: express.Request, res: express.Response) => {
    res.status(200).send('OK');
});

app.get('/get/:id', async (req: express.Request, res: express.Response) => {
  try {
      const result = await client.GET(req.params.id);
      if (!result) {
        res.sendStatus(404);
        return
      }
      res.json(result);
  } catch (error) {
      res.status(500).send('Error occurred');
  }
});

app.post('/set/:id', async (req: express.Request, res: express.Response) => {
  try {
      await client.SET(req.body);
      res.status(200).send('Data saved successfully');
  } catch (error) {
      res.sendStatus(500);
  }
});

app.listen(port, () => {
  console.log(`Express running on port ${port}`);
});
