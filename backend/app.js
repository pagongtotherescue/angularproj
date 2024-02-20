const express = require('express');
const app = express();

app.use('/api/posts', (req, res, next) => {
  const posts = [
    {id: 'ilyt143ag',
    title: 'from first sever-side post',
    content: 'coming from server side'},
    {id: 'ilyt143ag',
    title: 'from second sever-side post',
    content: 'second coming from server side'},
  ];
  res.status(200).json({
    message: 'Posts fetched successfully!',
    posts: posts
  });
});

module.exports = app;