const mysql=require('mysql2');
const db=mysql.createConnection({
    host:'localhost',
    user:'root',    
    password:'password', // Replace with your MySQL password
    database:"contact_form" // Replace with your MySQL database name,
});

db.connect((err)=>{
    if(err){
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database');
});

module.exports=db;