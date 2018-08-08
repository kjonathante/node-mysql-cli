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
    choices: getData,
  },{
    type: 'input',
    name: 'qty',
    message: 'How many units would you like to buy ? ',
    default: 0,
    validate: function() { return true },
  }]).then(
    function(answers) {
      console.log(answers)
      conn.end()
    }
  )
}

function getData() {
  return new Promise( function(resolve, reject) {
    conn.query('SELECT * FROM products WHERE stock_quantity > 0',
      function(error, results, fields){
        if (error) throw reject(error)

        var arr = []
        for( var row of results ) {
          arr.push({
            name: row.product_name.padEnd(20) + ' ' + row.price.toFixed(2).padStart(10),
            value: [row.id, row.price],
            short: row.product_name + ' @ $' + row.price.toFixed(2),
          })
        }
        resolve(arr)
      }
    )
  })
}
