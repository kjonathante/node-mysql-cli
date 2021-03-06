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
    filter: function(input) { return parseFloat(input) }, //convert input into type number
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
    async function(answers) {
      if (answers.confirm) {
        await setQty(answers)
      }
      conn.end()
    }
  )
}

function getProducts() {
  return new Promise( function(resolve, reject) {
    conn.query('SELECT * FROM products WHERE stock_quantity > 0',
      function(error, results, fields){
        if (error) reject(error)

        var arr = []
        for( var row of results ) {
          arr.push({
            name: row.product_name.padEnd(20) + ' ' + row.price.toFixed(2).padStart(10),
            value: {
              id: row.id, 
              price: row.price, 
              qty: row.stock_quantity, 
              productSales: row.product_sales
            },
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
    if (!(parseFloat(qty) >= 0)) resolve('Wrong Input')

    var quantity = parseFloat(qty);
    if (quantity === 0) resolve(true)
    conn.query({
      sql: 'SELECT stock_quantity FROM products WHERE id=?',
      values: [answer.item.id]
    }, function(error, results, fields){
      if (error) reject(error)
      
      resolve(results[0].stock_quantity>=quantity? true : 'Insufficient quantity!')
    })
  })
}

// update stock_quantity and product_sales fields
function setQty(answers) {
  return new Promise( function(resolve, reject) {
    conn.query({
      sql: 'UPDATE products SET stock_quantity=?, product_sales=? WHERE id=?',
      values: [ 
        answers.item.qty-answers.qty,
        answers.item.productSales + (answers.qty*answers.item.price),
        answers.item.id
      ]
    }, function(error, results, fields){
      if (error) reject(error)

      console.log('\u{2705}  Transaction completed.')
      resolve();
    })
  })
}
