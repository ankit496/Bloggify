const express=require('express')
const path=require('path')
const mongoose=require('mongoose')
const app=express()
const {checkForAuthenticationCookie}=require('./middleware/authentication')
const cookieParser=require('cookie-parser')
const Blog=require('./models/blog')
const MongoStore=require('connect-mongo')
const dotenv=require('dotenv')
dotenv.config()

app.set('view engine',"ejs")
app.set("views",path.resolve("./views"))

app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(checkForAuthenticationCookie("token"))
app.use(express.static(path.resolve('./public')))

const userRoute=require('./routes/user')
const blogRoute=require('./routes/blog')

// mongoose.connect('mongodb://127.0.0.1:27017/bloggify')
// .then(()=>{
//     console.log('connection open')
// })
// .catch(err=>{
//     console.log('oh no error')
//     console.log(err)
// })
const dbUrl=process.env.dbUrl
mongoose.connect(dbUrl)
const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error"))
db.once("open", () => {
    console.log('Database connected')
})
const store=MongoStore.create({
    mongoUrl:dbUrl,
    touchAfter:24*60*60,
    crypto:{
        secret:'thisisasecret'
    }
})
store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
  store,
  name: 'session',
  secret:"thisisasecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
      httpOnly: true,
      // secure: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7
  }
}
app.get('/',async (req,res)=>{
    const allBlogs=await Blog.find({})
    res.render('home',{
        user:req.user,
        blogs:allBlogs
    })
})

app.use('/user',userRoute)
app.use('/blog',blogRoute)
const port=8000
app.listen(port,()=>{
    console.log('app running on port ',port)
})