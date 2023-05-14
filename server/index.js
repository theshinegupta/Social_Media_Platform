const express=require('express');
const dotenv=require('dotenv');
const dbConnect=require('./dbConnect');
const authRouter=require('./routers/authRouter');
const postRouter=require("./routers/postRouter");
const userRouter=require("./routers/UserRouter");
const morgan=require('morgan');
const cors=require('cors');
const cookieParser=require("cookie-parser");
const cloudinary=require('cloudinary').v2;

dotenv.config("./.env");





// Configuration 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const app=express();

//middlewares
app.use(express.json({limit:'10mb'}));
app.use(morgan('common'));
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}))



app.use('/auth',authRouter);
app.use("/posts",postRouter);
app.use('/user',userRouter);
app.get('/',(req,res)=>{
    res.status(200).send('ok from server');
})

const PORT=process.env.PORT || 4200;

dbConnect();

app.listen(PORT,()=>{
    console.log(`listening on ${PORT}`);
});
