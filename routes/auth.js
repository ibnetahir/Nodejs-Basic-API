const express = require("express");
const User = require("../models/User");
const logger = require('../utils/winston.service');
const { body, validationResult } = require("express-validator");
const router = express.Router();
let jwt = require('jsonwebtoken');
const validateUser = require("../middleware/fetchuser");
const { hash, compare, genSalt } = require('../utils/bcrypt.service');


const JWT_SECRET = 'Let$sgo';
// ROUTE 1; Create a User using: POST "/api/users"
router.post(
  "/users",
  [
    body("email").isEmail(),
    body("name").isLength({ min: 4 }),
    body("password").isLength({ min: 8 }),
  ],
  async (req, res) => {
    let success = false
    // if there are errors then return bad request and errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }
    try {
      // check wheter user exits with the same email.  
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({success, error: "sorry user with the same email already exits" });
      }
      // Create a new user
      const salt = await genSalt(10);
      const  secPass = await hash(req.body.password, salt)
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      const data = {
        user:{
            id: user.id
        }
      }

      const authToken = jwt.sign(data, JWT_SECRET);
      success = true
      res.json({success, authToken});
    } catch (error) {
      logger.error(error.message);
      res.status(500).send("some error occured");
    }
    // res.send(req.body);
  }
);

// ROUTE2; Authenticate a User using: POST "/api/login"
router.post(
    "/login",
    [
      body("email").isEmail(),
      body("password", 'Password cannot be blank').exists(),
    ], async (req, res) => {
        // if there are errors then return bad request and errors
        let success;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const {email, password} = req.body;
        try {
            let user = await User.findOne({email});
            if(!user){
                success = false
                return res.status(400).json({error: "Please try to login with valid credentials"})
            }

            const passwordCompare = await compare(password, user.password);
            if (!passwordCompare) {
                success = false
                return res.status(400).json({success, error: "Please try to login with valid credentials"})
            }
            const data = {
                user:{
                    id: user.id
                }
            }

            const authToken = jwt.sign(data, JWT_SECRET);
            success = true
            res.json({success,authToken});
        } catch (error) {
            logger.error(error.message);
            res.status(500).send("Intenel server error");
          }
    }
);

// ROUTE 3;  Get logged in user details using: GET "/api/user". Login required
router.get('/user', validateUser , async (req, res)=>{
    try {
        let userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        if (!user) {
          res.status(404).send("user does not exist!")
        }
        res.send(user).status(200)
        
    } catch (error) {
        logger.error(error.message);
        res.status(500).send("Intenel server error");
    }
})

// ROUTE 4; Get logged in user's Balance using: GET "/api/user/balance". Login required
router.get('/user/balance', validateUser , async (req, res)=>{
  try {
      let userId = req.user.id;
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).send("user does not exist!");
      }
      res.send(String(user.balance));
      
  } catch (error) {
      logger.error(error.message);
      res.status(500).send("Intenel server error");
  }

});

// ROUTE 5; Get logged in user's id using: GET "/api/user/id". Login required
router.get("/user/id", validateUser, (req, res)=>{
  try {
    let userId = req.user.id
    res.send({userId})
  } catch (error) {
    logger.error(error.message);
    res.status(500).send("Intenel server error");
  }
})

// ROUTE 6; Update logged in user's Balance using: PUT "/api/user/balance". Login required 
router.put("/user/balance", validateUser, async (req, res)=>{
  try {
    if (req.body.newBalance >= 0) {
      let {newBalance} = req.body;
      let userId = req.user.id;
      let user = await User.findById(userId).select(["-password", "-email", "-name", "-balance", "-__v", "-date"]);

      if (user) {
        user = await User.findByIdAndUpdate(userId, {$set:{balance:Number(newBalance)}}, {new: true});
        let balance = user.balance
        res.status(200).send({balance});
      } else{
        res.status(404).send("user does not exist")
      }
    } else {
      res.status(400).send("Balance cannot be negative!")
    }
  } catch (error) {
    logger.error(error.message);
    res.status(500).send("Intenel server error");
  }
});

module.exports = router;