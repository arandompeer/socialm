import express from 'express';
import fetch from 'node-fetch';
import { MongoClient } from "mongodb";
import { createApi } from 'unsplash-js';

import { createFlickr } from "flickr-sdk"
import 'dotenv/config'

const app = express()
const port = process.env.PORT


global.fetch = fetch;

const { flickr } = createFlickr(process.env.FLICKRAPI)
const unsplash = createApi({ accessKey: process.env.UNSPLASHAPI });
const uri = process.env.MONGOURI;



async function run(doc, client) {
  try {
    const database = client.db("tagz");
    const socialm = database.collection("socialm");

    const result = await socialm.insertOne(doc);

    console.log(`A document was inserted with the _id: ${result.insertedId}`);
  } finally {

    await client.close();

  }
}



app.get('/flickr/:hashtag', async (req, res) => {
  const client = new MongoClient(uri);
  let hashtag = req.params.hashtag;

  let results = await flickr('flickr.photos.search', { tags: `${hashtag}`, per_page: 20 })


  let formattedResults = [];

  for (let i = 0; i < results.photos.photo.length; i++) {
    formattedResults.push({
      img: `https://live.staticflickr.com/${results.photos.photo[i].server}/${results.photos.photo[i].id}_${results.photos.photo[i].secret}.jpg`,
      title: results.photos.photo[i].title
    })


  }
  res.send(formattedResults)
  console.log(formattedResults)
  let data = {};
  data.hashtagKey = hashtag;
  data.formattedResults = formattedResults;
  
  run(data, client).catch(console.dir);
})




app.get('/unsplash/:hashtag', async (req, res) => {
  const client = new MongoClient(uri);
  let hashtag = req.params.hashtag;

  let results = await unsplash.search.getPhotos({
    query: hashtag,
    page: 1,
    perPage: 10,
  });

  let formattedResults = [];

  for (let i = 0; i < results.response?.results.length; i++) {
    formattedResults.push({
      img: results.response?.results[i].urls.raw,
      title: results.response?.results[i].description,
    })


  }
  res.send(formattedResults)
  console.log(formattedResults)
  let data = {};
  data.hashtagKey = hashtag;
  data.formattedResults = formattedResults;
  
  run(data, client).catch(console.dir);
})





app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})