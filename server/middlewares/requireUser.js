const jwt=require('jsonwebtoken');
const { error } = require('../utils/responseWrapper');
const User = require('../models/User');

module.exports =async (req, res, next) =>{
    if(!req.headers || !req.headers.authorization || !req.headers.authorization.startsWith("Bearer"))
    {
       
        // return res.status(401).send('Authorization Header is required');
        return res.send(error(401,'Authorization Header is required'));
        
    }

   
    const accesToken= req.headers.authorization.split(" ")[1];
    
    try{
        // console.log(process.env.ACCESS_TOKEN_PRIVATE_KEY);
            const decoded=jwt.verify(accesToken, process.env.ACCESS_TOKEN_PRIVATE_KEY)
            req._id=decoded._id;

            const user=await User.findById(req._id);
            if(!user){
                return res.send(error(404,"User not Found "))
            }

    }
    catch (e){
        console.log(e);
        // return res.status(401).send("INVALID ACCESS KEY");
        return res.send(error(401,'Invalid Access Key'));

    }

    // console.log(accesToken);
    next();
};