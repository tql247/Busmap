require('dotenv').config();


var express = require('express');
const path = require("path");
var app = express();
var request = require('request');
// const PORT = 5000
const PORT = process.env.PORT || 5000



app.use(express.json());
app.use(express.urlencoded({ extended: false }));




const router = express.Router();

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + '/views/Busmap.html'));
});

router.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname + '/views/about.html'))
})

router.post("/getRoute", (req, res) => {
  var options = {
    'method': 'GET',
    'url': `http://apicms.ebms.vn/prediction/predictbystopid/${req.body.id}`,
    'headers': {
    }
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    res.send(response.body);
  });
})

app.use("/", router);
app.use("/assets", express.static(__dirname + "/views/assets"))
app.listen(PORT);



module.exports = app;
