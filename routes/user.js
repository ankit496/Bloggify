const {Router}=require('express')
const User=require('../models/user')
const router =Router()
router.get('/signin',(req,res)=>{
    return res.render("signin")
})
router.get('/signup',(req,res)=>{
    return res.render("signup")
})
router.post('/signin',async(req,res)=>{
    const {email,password}=req.body
    try{
        const token=await User.matchPasswordandGenerateToken(email,password)
        console.log(token)
        res.cookie('token',token).redirect("/")
    }
    catch(error){
        return res.render("signin",{
        error:"Incorrect Email or Password"
        });
    }
})
router.post('/signup',async (req,res)=>{
    console.log(req.body)
    // const {fullname,email,password}=req.body
    // await db.create({
    //     fullname:fullname,
    //     email:email,
    //     password:password
    // })
    const newUser=new User(req.body)
    await newUser.save()
    return res.redirect("/")
})
router.get('/logout',(req,res)=>{
   res.clearCookie('token').redirect("/") 
})
module.exports=router