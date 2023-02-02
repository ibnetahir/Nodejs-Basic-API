const express = require("express");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');
const fetchuser = require("../middleware/fetchuser");

const JWT_SECRET = 'Let$sgo';
// ROUTE 1; Create a User using: POST "/api/auth/createuser"
router.post(
  "/createuser",
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
      const salt = await bcrypt.genSalt(10);
      const  secPass = await bcrypt.hash(req.body.password, salt)
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
      console.error(error.message);
      res.status(500).send("some error occured");
    }
    // res.send(req.body);
  }
);

// ROUTE2; Authenticate a User using: POST "/api/auth/login"

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

            const passwordCompare = await bcrypt.compare(password, user.password);
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
            console.error(error.message);
            res.status(500).send("Intenel server error");
          }
    }
);

// ROUTE 3;  Get logged in user details using: POST "/api/auth/getuser". Login required

router.post('/getuser', fetchuser , async (req, res)=>{
    try {
        let userId = req.user.id;
        const user = await User.findById(userId).select("-password")
        res.send(user)
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Intenel server error");
    }
})

// ROUTE 4; Get logged in user's Balance using: POST "/api/auth/getuserbalance". Login required
router.post('/getuserbalance', fetchuser , async (req, res)=>{
  try {
      let userId = req.user.id;
      const user = await User.findById(userId).select(["-password", "-email", "-name", "-_id", "-__v", "-date"])
      res.send(String(user.balance));
      
  } catch (error) {
      console.error(error.message);
      res.status(500).send("Intenel server error");
  }

});

// ROUTE 5; Get logged in user's id using: POST "/api/auth/getuserid". Login required
router.post("/getuserid", fetchuser, (req, res)=>{
  try {
    let userId = req.user.id
    res.send({userId})
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Intenel server error");
  }
})

// ROUTE 6; Update logged in user's Balance using: PUT "/api/auth/updatebalance". Login required 
router.put("/updatebalance/:id", fetchuser, async (req, res)=>{
  try {
    if (req.body.newBalance >= 0) {
      let {newBalance} = req.body;
      let userId = req.user.id;
      
      let user = await User.findById(userId).select(["-password", "-email", "-name", "-balance", "-__v", "-date"]);
      user = await User.findByIdAndUpdate(userId, {$set:{balance:newBalance + 50}}, {new: true});
      let balance = user.balance
      res.status(200).send({balance});
    } else {
      res.status(400).send("Balance cannot be negative!")
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Intenel server error");
  }
});

module.exports = router;