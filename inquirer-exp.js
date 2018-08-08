//Experiments with inquirer
var mysql = require('mysql')
var inquirer = require('inquirer')


var conn = mysql.createConnection({
  user: 'root',
  password: '',
  port: '3306',
  host: 'localhost',
  database: 'bamazon_db'
})

// conn.connect( function(error){
//   if (error) throw error
//   //console.log( arguments )
//   conn.end()
// })

inquirer.prompt([ {
  type: 'list',
  name: 'id',
  message: 'Select a product',
  choices: getData
},{
  type: 'input',
  name: 'qty',
  message: 'How many items ?',
  validate: getQty
}]).then(
  function(answers) {
    console.log(answers)
    conn.end()
  }
)

function getData() {
  return new Promise( function(resolve, reject) {
    conn.query('SELECT * FROM products', function(error, results, fields){
      if (error) throw reject(error)
      //console.log(results);
      var arr = []
      for( var row of results ) {
        arr.push({
          name: row.product_name.padEnd(20) + ' ' + row.price,
          value: row.id,
          //short: row.product_name,
        })
      }
      //conn.end()
      resolve(arr)
    })
  })
}

function getQty(qty, answer) {
  return new Promise( function(resolve, reject) {
    console.log('value of qty --->', qty)
    console.log('valud of answer.id --->', answer.id)
    conn.query({
      sql: 'SELECT stock_quantity FROM products WHERE id=?',
      values: [answer.id]
    }, function(error, results, fields){
      if (error) throw reject(error)
      
      //conn.end()
      resolve(results[0].stock_quantity>=qty? true : 'Not Enough')
    })
  })
}
