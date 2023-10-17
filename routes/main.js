module.exports = function(app, shopData) {

    // Handle our routes
    app.get('/',function(req,res){
        res.render('index.ejs', shopData)
    });
    app.get('/about',function(req,res){
        res.render('about.ejs', shopData);
    });
    app.get('/search',function(req,res){
        res.render("search.ejs", shopData);
    });
    app.get('/search-result', function (req, res) {
        //searching in the database
        //res.send("You searched for: " + req.query.keyword);

        let sqlquery = "SELECT * FROM books WHERE name LIKE '%" + req.query.keyword + "%'"; // query database to get all the books
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({}, shopData, {availableBooks:result});
            console.log(newData)
            res.render("list.ejs", newData)
         });        
    });
    app.get('/register', function (req,res) {
        res.render('register.ejs', shopData);                                                                     
    }); 

    app.post('/registered', function (req,res) {

        const bcrypt = require('bcrypt');
        const saltRounds = 10;
        const plainPassword = req.body.password;
        console.log(req.body.username + ' ' + req.body.first + ' ' + req.body.last + ' ' + req.body.email + ' ' + req.body.password);

        bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
            console.log(hashedPassword);
            //Store hashed password in the database
            // saving data in database
            let sqlquery = "INSERT INTO logins (username, firstname, lastname, email, hashedPassword) VALUES (?,?,?,?,?)";
            //execute sql query
            let newrecord = [req.body.username, req.body.first, req.body.last, req.body.email, hashedPassword];
            db.query(sqlquery, newrecord, (err, result) => {
                if(err) {
                    return console.error(err.message);
                }
                else
                result = 'Hello '+ req.body.first + ' '+ req.body.last +' you are now registered!  We will send an email to you at ' + req.body.email + '.';
                result += ' Your password is: '+ req.body.password +' and your hashed password is: '+ hashedPassword;
                res.send(result);

            })  
        })                                                                            
    });
    app.get('/login', function (req,res) {
        res.render('login.ejs', shopData);                                                                     
    }); 

    app.post('/loggedin', function(req, res) {
        const bcrypt = require('bcrypt');
        let sqlquery = "SELECT hashedPassword FROM logins WHERE username = '" + req.body.username + "'"
        db.query(sqlquery, (err, result) => {
            if(err) {
                res.redirect('./')
            }
            let newData = Object.assign({}, shopData, {logins:result});
            console.log(newData);
            const theJSON = JSON.stringify(result);
            const theJSON1 = JSON.parse(theJSON);
            hashedPassword = theJSON1[0].hashedPassword;
            console.log(hashedPassword)
            bcrypt.compare(req.body.password, hashedPassword, function(err, result) {
                if (err) {
                    res.send(err.message);
                }
                else if(result == true) {
                    res.send("Successfully logged in!")
                }
                else {
                    res.send("Wrong username and/or password.")
                }
            })
        })
    })

    app.get('/list', function(req, res) {
        let sqlquery = "SELECT * FROM books"; // query database to get all the books
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({}, shopData, {availableBooks:result});
            console.log(newData)
            res.render("list.ejs", newData)
         });
    });

    app.get('/listusers', function(req, res) {
        let sqlquery = "SELECT * FROM logins";
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./')
            }
            let newData = Object.assign({}, shopData, {logins:result});
            console.log(newData)
            res.render("listusers.ejs", newData)
        });
    });

    app.get('/addbook', function (req, res) {
        res.render('addbook.ejs', shopData);
     });
 
     app.post('/bookadded', function (req,res) {
           // saving data in database
           let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";
           // execute sql query
           let newrecord = [req.body.name, req.body.price];
           db.query(sqlquery, newrecord, (err, result) => {
             if (err) {
               return console.error(err.message);
             }
             else
             res.send(' This book is added to database, name: '+ req.body.name + ' price '+ req.body.price);
             });
       });    

       app.get('/bargainbooks', function(req, res) {
        let sqlquery = "SELECT * FROM books WHERE price < 20";
        db.query(sqlquery, (err, result) => {
          if (err) {
             res.redirect('./');
          }
          let newData = Object.assign({}, shopData, {availableBooks:result});
          console.log(newData)
          res.render("bargains.ejs", newData)
        });
    });       

}
