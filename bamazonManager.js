var mysql = require('mysql')
var inquirer = require('inquirer')

var conn = mysql.createConnection({
  host: 'localhost',
  port: '3306',
  database: 'bamazon_db',
  user: 'root',
  password: '',
})


conn.connect( function(error){
  if (error) {
    return console.log(error)
  }
  //console.log( arguments )
  // start app
  main()
})

function main() {
  var mainMenu = [
    'View Products for Sale',
    'View Low Inventory',    
    'Add to Inventory',
    'Add New Product',
  ];

  inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: 'Main Menu: ',
    choices: mainMenu,
  }]).then( function(answers) {
    console.log(answers)
    conn.end();
  })
}