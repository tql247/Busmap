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

router.post("/getStopInfo", (req, res) => {
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

router.get("/getListBus", (req, res) => {
  var options = {
    'method': 'GET',
    'url': `http://apicms.ebms.vn/businfo/getallroute`,
    'headers': {
    }
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    res.send(response.body);
  });
})

router.post("/getRouteInfo", (req, res) => {
  var options = {
    'method': 'GET',
    'url': `http://apicms.ebms.vn/businfo/getroutebyid/${req.body.id}`,
    'headers': {
    }
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    res.send(response.body);
  });
})

router.post("/getVarsByRoute", (req, res) => {
  var options = {
    'method': 'GET',
    'url': `http://apicms.ebms.vn/businfo/getvarsbyroute/${req.body.id}`,
    'headers': {
    }
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    res.send(response.body);
  });
})

router.post("/getPathsByVar", (req, res) => {
  var options = {
    'method': 'GET',
    'url': `http://apicms.ebms.vn/businfo/getpathsbyvar/${req.body.id}/${req.body.var}`,
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
