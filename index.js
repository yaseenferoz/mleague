const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const expressLayouts = require('express-ejs-layouts');
const fs = require('fs');
const path = require('path');


const Movie = require('./models/Movie');
const { render } = require("ejs");
const { findOne } = require("./models/Movie");


let player = Movie.find({});

const app = express();

app.use(express.static(path.join(__dirname,'/public')));
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
const imageMimeTypes = ["image/jpeg", "image/png", "images/gif"];


// DATABASE CONNECTION
mongoose.connect('mongodb+srv://admin-yaseen:tumkur45@playercluster.n1bok.mongodb.net/playerDB?retryWrites=true&w=majority',{ useNewUrlParser: true,useUnifiedTopology: true});
// mongoose.connect('mongodb://localhost:27017/myproject',{ useNewUrlParser: true,useUnifiedTopology: true});
const db = mongoose.connection;
db.once('error', (err)=>{
    console.log(err);    
});
db.on("open", ()=>{
    console.log("database connection success");
})


// MIDDLEWARE
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));




const list=[];

// ROUTES
app.get("/", async (req, res, next) => {
  console.log(list.length);
 if(list.length===0){
  try{
    const movie  = await Movie.find();
    res.render("index", {
      movie
    });
  }catch (err){
    console.log("err: "+ err); 
  }
 }else {
   res.render("selected",{list})
 }
});


// app.get("/admin",(req,res)=>{
//   res.render("login")
// })

app.post("/clearlist", (req,res)=>{
  list.splice(0,list.length);
  console.log(list);
  res.render("clearlist");
})



// app.post("/login", async(req,res,next)=>{
//   let userName= req.body.adminName;
//   let passWord=req.body.adminPassword;

//   if(userName==="admin" && passWord==="bemiraki123"){
//     const movie  =  await Movie.find();
//     res.render("list", {
//       movie
//     });
//   }
//   else {
    
//     res.render("login");
//   }
// })

app.get("/admin", async (req, res, next) => {
  try{
    const movie  = await Movie.find();
    res.render("list", {
      movie
    });
  }catch (err){
    console.log("err: "+ err); 
  }
});



app.post('/selected', async (req,res,next)=>{
  const iD= req.body.plyername;
  

for(let i=0 ;i<iD.length;i++)
  {
    let  plist= await Movie.findById(iD[i])
     list.push(plist)
  
  }
console.log(list);

res.render("selected",{list})
});


app.get('/selected', (req,res)=>{
res.render("selected",{list})
})




app.post('/add', async ( req, res, next)=>{


  const {name,mobile, city, playerType,upiNumber,img} = req.body;
 
  const movie = new Movie({
    name,
    mobile,
    playerType,
    city,
    upiNumber
 
  });





   
    saveImage(movie, img);
    const myMovie  = await Movie.find();
    for (let m of myMovie) {
  if((m.name).includes(req.body.name) ){
    res.render("already",{name:req.body.name});
  }
}
    try{
      const newMovie = await movie.save();
      res.render('thankyou',{fullName:movie.name})  ;
    }catch (err){
      console.log(err);    
    }


    


 
  // SETTING IMAGE AND IMAGE TYPES

});




function saveImage(movie, imgEncoded) {
  // CHECKING FOR IMAGE IS ALREADY ENCODED OR NOT
  if (imgEncoded == null) return;

  // ENCODING IMAGE BY JSON PARSE
  // The JSON.parse() method parses a JSON string, constructing the JavaScript value or object described by the string
  const img = JSON.parse(imgEncoded);
  console.log( "JSON parse: "+ img);
  
  // CHECKING FOR JSON ENCODED IMAGE NOT NULL 
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
  // AND HAVE VALID IMAGE TYPES WITH IMAGE MIME TYPES
  if (img != null && imageMimeTypes.includes(img.type)) {

    // https://nodejs.org/api/buffer.html
    // The Buffer class in Node.js is designed to handle raw binary data. 
    // SETTING IMAGE AS BINARY DATA
    movie.img = new Buffer.from(img.data, "base64");
    movie.imgType = img.type;
  }
}




app.get('/delete/:id',(req,res)=>{
  Movie.findByIdAndRemove(req.params.id,(err,doc)=>{
    console.log(doc);
if(!err){
  res.redirect('/admin');
}else {
  console.log(err);
}
  });
})



// app.get('/delete/:id',(req,res)=>{
 
//   })
// res.send();
// })




const port = process.env.PORT || 4000;
app.listen(port, () => console.log("Server is running on : " + port));
