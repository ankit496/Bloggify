const mongoose=require('mongoose')
const { createHmac, randomBytes } =require("crypto");
const { createTokenForUser } = require('../services/authentication');
const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true
    },
    email: {
      type: String,
      require: true,
      unique: true
    },
    salt: {
      type: String
    },
    profileImageUrl: {
      type: String,
      default: "./images/default.png"
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER"
    },
    password: {
      type: String,
      required: true
    }
},{timestamps:true});
userSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) return;
  const salt = randomBytes(16).toString();
  const hashedPassword = createHmac("sha256", salt)
    .update(user.password)
    .digest("hex");
  this.salt = salt;
  this.password = hashedPassword;
  next();
});
userSchema.static('matchPasswordandGenerateToken',async function(email,password){
    const curr_user=await this.findOne({email})
    if(!curr_user)
        throw new Error('User not found')
    const salt=curr_user.salt
    const hashedPassword=curr_user.password
    const userProvidedHash=createHmac('sha256',salt)
        .update(password)
        .digest("hex")
    if(hashedPassword!==userProvidedHash)
        throw new Error('Incorrect Password')
    const token=createTokenForUser(curr_user)
    return token
})
const User = mongoose.model('User', userSchema);
module.exports=User;
