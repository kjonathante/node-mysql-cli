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

async function main() {
  var mainMenu = [
    'View Products for Sale',
    'View Low Inventory',    
    'Add to Inventory',
    'Add New Product',
    'Exit',
  ];

  var answers;

  do {
    answers = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'Main Menu: ',
      choices: mainMenu,
    }])

    switch (answers.action) {
      case 'View Products for Sale':
        await viewProducts();
        break;
      case 'View Low Inventory':
        await viewLowInventory();
        break;
      case 'Add to Inventory':
        await addToInventory();
        break;
      case 'Exit':
        conn.end()
        return
        break
      default:
        console.log('Select Action');
        break;
    }
  } while (true);
}

function viewProducts() {
  return new Promise( function(resolve, reject) {
    conn.query(
      'SELECT * FROM products',
      function(error, results, fields){
        if (error) throw reject(error)

        printTable(results)
        resolve(true)
      }
    )
  })
}

function viewLowInventory() {
  return new Promise( function(resolve, reject) {
    conn.query(
      'SELECT * FROM products WHERE stock_quantity < 5',
      function(error, results, fields){
        if (error) throw reject(error)

        if (results.length > 0)
          printTable(results)
        else
          console.log( 'Everything is above threshold.\n\n' )

        resolve(true)
      }
    )
  })
}

function printTable(results) {
  console.log(`${'ID'.padStart(5)} ${'Name'.padEnd(20)} ${'Price'.padStart(10)} ${'Quantity'.padStart(10)}`)
  for( var row of results ) {
    console.log(`${(row.id + '').padStart(5)} ${row.product_name.padEnd(20)} ${('$ ' + row.price.toFixed(2)).padStart(10)} ${(row.stock_quantity+'').padStart(10)}`)
  }
  console.log('\n\n')
}

function addToInventory() {
  return new Promise( function(resolve, reject) {
    inquirer.prompt([{
      type: 'list',
      name: 'item',
      message: 'Select product to add more ? ',
      choices: getProducts
    },{
      type: 'input',
      name: 'qty',
      message: 'Quanity ?',
      validate: function(input) { return parseFloat(input) >= 0 || 'Wrong Input' },
      filter: function(input) { return parseFloat(input) }
    },{
      type: 'confirm',
      name: 'confirm',
      default: false,
      when: function(answer){ return answer.qty > 0 },
      message: 'Proceed',
    }]).then( async function(answers) { 
      if (answers.confirm) {
        await updateProduct(answers)
      }
      resolve(true) 
    })
  })
}

function getProducts() {
  return new Promise( function(resolve, reject) {
    conn.query('SELECT * FROM products',
      function(error, results, fields){
        if (error) throw reject(error)

        var arr = []
        for( var row of results ) {
          arr.push({
            name: `${row.product_name.padEnd(20)} ${(row.stock_quantity+'').padStart(5)}`,
            value: {id: row.id, qty: row.stock_quantity},
            short: row.product_name + ' ' + row.stock_quantity,
          })
        }
        resolve(arr)
      }
    )
  })
}

function updateProduct(answers) {
  return new Promise( function(resolve, reject) {
    conn.query({
      sql: 'UPDATE products SET stock_quantity=? WHERE id=?',
      values: [answers.item.qty+answers.qty, answers.item.id]
    }, function(error, results, fields){
      if (error) throw reject(error)

      resolve()
    })
  })
}