const express=require('express')
const path=require('path')
const mongoose=require('mongoose')
const app=express()
const {checkForAuthenticationCookie}=require('./middleware/authentication')
const cookieParser=require('cookie-parser')
const Blog=require('./models/blog')

app.set('view engine',"ejs")
app.set("views",path.resolve("./views"))

app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(checkForAuthenticationCookie("token"))
app.use(express.static(path.resolve('./public')))

const userRoute=require('./routes/user')
const blogRoute=require('./routes/blog')

mongoose.connect('mongodb://127.0.0.1:27017/bloggify')
.then(()=>{
    console.log('connection open')
})
.catch(err=>{
    console.log('oh no error')
    console.log(err)
})
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
app.listen(port,()=>console.log('app running on port ',port))