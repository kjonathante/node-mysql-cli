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
    name: 'item',
    message: 'Enter you product selection: ',
    choices: getProducts,
  },{
    type: 'input',
    name: 'qty',
    message: 'How many units would you like to buy ? ',
    default: 0,
    validate: checkQty,
  },{
    type: 'confirm',
    name: 'confirm',
    default: false,
    when: function(answer){ return answer.qty > 0 },
    message: function(answer){
      return `Total cost is $${(answer.item.price*answer.qty).toFixed(2)}. Would you like to proceed ?`
    },
  }]).then(
    function(answers) {
      if (answers.confirm) {
        setQty(answers)
      }
      conn.end()
    }
  )
}

function getProducts() {
  return new Promise( function(resolve, reject) {
    conn.query('SELECT * FROM products WHERE stock_quantity > 0',
      function(error, results, fields){
        if (error) throw reject(error)

        var arr = []
        for( var row of results ) {
          arr.push({
            name: row.product_name.padEnd(20) + ' ' + row.price.toFixed(2).padStart(10),
            value: {id: row.id, price: row.price, qty: row.stock_quantity},
            short: row.product_name + ' @ $' + row.price.toFixed(2),
          })
        }
        resolve(arr)
      }
    )
  })
}

function checkQty(qty, answer) {
  return new Promise( function(resolve, reject) {
    conn.query({
      sql: 'SELECT stock_quantity FROM products WHERE id=?',
      values: [answer.item.id]
    }, function(error, results, fields){
      if (error) throw reject(error)
      
      resolve(results[0].stock_quantity>=qty? true : 'Insufficient quantity!')
    })
  })
}

function setQty(answers) {
  conn.query({
    sql: 'UPDATE products SET stock_quantity=? WHERE id=?',
    values: [answers.item.qty-answers.qty, answers.item.id]
  }, function(error, results, fields){
    if (error) throw error
    console.log('Completed.')
    //console.log('changed ' + results.changedRows + ' rows')
  })
}