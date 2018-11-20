const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const db = "mongodb://Miloye:miloye11@ds135798.mlab.com:35798/studentdb"
const User = require('../models/user')
const jwt = require('jsonwebtoken')

mongoose.connect(db, err => {
    if(err){
        console.error('Error'+err)
    }else{
        console.log('Connected to mongodb')
    }
})

function verifyToken(req, res, next){
    if(!req.headers.authorization){
        res.status(401).send('Unauthorized request')
    }
    let token = req.headers.authorization.split(' ')[1]

    if(token === 'null'){
        res.status(401).send('Unauthorized request')
    }
    let payload = jwt.verify(token, 'secretKey')

    if(!payload){
        res.status(401).send('Unauthorized request')
    }
    req.useId = payload.subject
    next()
}

router.get('/', (req, res) => {
    res.send('From api route')
})

router.post('/add', verifyToken, (req, res) => {
    let userData = req.body
    let user = new User(userData)

    user.save((err, registeredUser) => {
        if(err){
            console.log(err)
        }else{
            let payload = {subject: registeredUser._id}
            let token = jwt.sign(payload, 'secretKey')
            res.status(200).send({token})
        }
    })
})

router.post('/login', (req, res) => {
    let userData = req.body

    User.findOne({email: userData.email}, (error, user) => {
        if(error){
            console.log(error)
        }else{
            if(!user){
                res.status(401).send('Invalid info')
            }else{
                if(user.password !== userData.password){
                    res.status(401).send('Invalid info')
                }else{
                    let payload = {subject: user._id}
                    let token = jwt.sign(payload, 'secretKey')
                    res.status(200).send({token})
                }
            }
        }
    })
})

router.get('/getall', verifyToken, (req, res) => {
    User.find({}, (err, registeredUsers) => {
        if(err){
            console.log(err)
        }else{
            res.status(200).send(registeredUsers)
        }
    })
})

router.delete('/:id/delete', (req, res) => {
    User.findByIdAndDelete(req.params.id, err => {
        if(err){
            console.log('err')
        }else{
            res.send('Deleted successfully')
        }
    })
})

router.put('/:id/update', (req, res) => {
    User.findByIdAndUpdate(req.params.id, {$set: req.body}, err => {
        if(err){
            console.log('err')
        }else{
            res.send('Product updated')
        }
    })
})

module.exports = router