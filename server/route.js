const express = require('express');
const router = express.Router();

router.get("/", (req, res) =>  {
  res.send("Hello World, our first router set.")
})

module.exports = router;