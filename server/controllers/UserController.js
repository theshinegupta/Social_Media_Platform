const Post = require("../models/Post");
const User = require("../models/User");
const { post } = require("../routers/UserRouter");
const { mapPostOutput } = require("../utils/Utils");
const { error, success } = require("../utils/responseWrapper");

const cloudinary=require('cloudinary').v2;


const followOrUnfollowUserController =async (req,res) =>{

    try{

        const {userIdToFollow} = req.body;
        const currUserId=req._id;
    
        const userToFollow= await User.findById(userIdToFollow);
        const currUser=await User.findById(currUserId);
        
         if(currUserId===userIdToFollow)
         {
            return res.send(error(409,'User Cannot Follow Themselves'))
         }
         if(!userToFollow){
            return res.send(error(404,'User to Follow Not Found'));
         }
    
         if(currUser.followings.includes(userIdToFollow)){
            //already followed
            // console.log("hello1");
            const followingIndex=currUser.followings.indexOf(userIdToFollow);
            // console.log("hello2");
            currUser.followings.splice(followingIndex,1);
    
            const  followerIndex=userToFollow.followers.indexOf(currUserId);
            console.log(followerIndex);
            userToFollow.followers.splice(followerIndex,1);
    
            
        }else{
    
            userToFollow.followers.push(currUserId);
            currUser.followings.push(userIdToFollow);
         }

         await userToFollow.save();
         await currUser.save();

         return res.send(success(200,{user: userToFollow}));

    }catch (e){
        // console.log("hello from userController");
        return res.send(error(500,e.message));

    }
};


const getPostOfFollowing= async (req,res) =>{

    try {
        const currUserId=req._id;
        const  currUser=await User.findById(currUserId).populate("followings");

    const fullPosts=await Post.find({
        'owner':{
            '$in':currUser.followings,
        }
    }).populate('owner')

    const posts=fullPosts.map(item => mapPostOutput(item,req._id)).reverse();
    
    const followingsIds=currUser.followings.map(item=>item._id)
    followingsIds.push(req._id);

    const suggestions=await User.find({
        _id:{
            $nin:followingsIds
        }
    })


    return res.send(success(200,{...currUser._doc,suggestions,posts}));
    } catch (e) {
        return res.send(error(500,e.message));
        
    }

    
}

const getMyPosts=async  (req,res)=>{
    try {
        const currUserId=req._id;
        const allUserPosts=await Post.find({owner: currUserId});

        return res.send(success(200,{allUserPosts}));
        
    } catch (e) {
        return res.send(error(500,e.message));
        
    }

}

const getUserPosts=async (req,res)=>{
    try {
        const userId=req.body.userId;

        if(!userId)
        {
            return res.send(error(400,"UserId is Required"));
        }
        const currUserId=req._id;
        const currUser=await User.findById(currUserId);
        

        if(currUser.followings.includes(userId)){
        
           
            const allUserPosts=await Post.find({owner: userId}).populate('likes');
            return res.send(success(200,{allUserPosts}));
        }
        else{
            res.send(error(500,'User is Not in Your Connection'));
        }
       
        } catch (e) {
        return res.send(error(500,e.message));
        }

    console.log("hello from user posts");
    return res.send(success(200,"Post From user Id"))
    
}

const deleteMyProfile= async (req,res)=>{
    try {
        const currUserId=req._id;
       const currUser=await User.findById(currUserId);

       if(!currUser)
       {
        res.send(error(404,'User Not Found')); 
       }

    //delete all post of currUser
    await Post.deleteMany({
        owner:currUserId,
    });

    // remove currUser from its Followers followings
    currUser.followers.forEach(async (followerId) =>{
        if(followerId)
        {
            const follower= await User.findById(followerId);
            const index=follower.followings.indexOf(currUserId);
            follower.followings.splice(index,1);
            await follower.save();
        }
        
    })

    //remove currUser from its following follwers
    currUser.followings.forEach(async (followingId) =>{
        const following= await User.findById(followingId);
        const index=following.followers.indexOf(currUserId);
        following.followers.splice(index,1);
        await following.save();
    })

    //remove currUser from all likes 
    //we can optmize it by creating separate table of likes
    const allPosts= await Post.find();
    
    allPosts.forEach( async (post) =>{
        const index=post.likes.indexOf(currUserId);
        post.likes.splice(index,1);
        await post.save();
    })

    await currUser.deleteOne();
    // await currUser.remove();

    res.clearCookie('jwt',{
        httpOnly:true,
        secure:true
    })


    return res.send(success(200,'User Deleted'));
        
    } catch (e) {
        console.log(e);
        return res.send(error(500,e.message));
        
    }
    
}

const getMyInfo=async (req,res)=>{
    try {
       
        const user=await User.findById(req._id);
        return res.send(success(200,{user}));
        
    } catch (e) {
        
        return res.send(error(500,e.message));
        
    }
    

}



const updateUserProfile = async (req, res) => {
    try {
        const { name, bio, userImg } = req.body;

        
        const user = await User.findById(req._id);

        if (name) {
            user.name = name;
        }
        if (bio) {
            user.bio = bio;
        }
        // console.log("hello in userImg");
        if (userImg) {
            

            const cloudImg=await cloudinary.uploader.upload(userImg,{folder: 'profileImg'});
            user.avatar={
                publicId:cloudImg.public_id,
                url:cloudImg.secure_url
            }

           
        }
        await user.save();
        return res.send(success(200, { user }));
    } catch (e) {
        console.log("error in", e.message);
        return res.send(error(500, e.message));
    }
};

const getUserProfile=async (req,res)=>{
    try {
        const userId=req.body.userId
        const user=await  User.findById(userId).populate({
            path:'posts',
            populate:{
                path: 'owner'
            }
        });

        const fullPosts=user.posts;
        const posts=fullPosts.map(item=>mapPostOutput(item,req._id)).reverse();

        return res.send(success(200,{...user._doc,posts}));
    } catch (e) {

        return res.send(error(500,e.message))
        
    }
    
}

module.exports ={
    followOrUnfollowUserController,
    getPostOfFollowing,
    getMyPosts,
    getUserPosts,
    deleteMyProfile,
    getMyInfo,
    updateUserProfile,
    getUserProfile
}