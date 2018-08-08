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
  inquirer.prompt([ {
    type: 'list',
    name: 'id',
    message: 'Enter you product selection: ',
    choices: ['selection 1','selection 2'],
  },{
    type: 'input',
    name: 'qty',
    message: 'How many units would you like to buy ? ',
    validate: function() { return true },
  }]).then(
    function(answers) {
      console.log(answers)
      conn.end()
    }
  )
}