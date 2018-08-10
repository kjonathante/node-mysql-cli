var os = require('os')
var mysql = require('mysql')
var inquirer = require('inquirer')
var {table} = require('table')

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
      message: 'Main Menu',
      choices: mainMenu,
      prefix: '\uD83D\uDDC4\uFE0F ',
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
      case 'Add New Product':
        await addNewProduct();
        break;
      case 'Exit':
        conn.end()
        return
        break
      default:
        break;
    }
  } while (true);
}

function viewProducts() {
  return new Promise( function(resolve, reject) {
    conn.query(
      'SELECT * FROM products',
      function(error, results, fields){
        if (error) reject(error)

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
        if (error) reject(error)

        if (results.length > 0)
          printTable(results)
        else
          console.log( os.EOL + 'Everything is above threshold.' + os.EOL + os.EOL )

        resolve(true)
      }
    )
  })
}

function printTable(results) {
  var data = []

  var config = {
    columns: {
      0: {
        alignment: 'right',
      },
      2: {
        alignment: 'right',
      },
      3: {
        alignment: 'right',
      }
    }
  }

  var tableHeader = []
  tableHeader.push('Product ID')
  tableHeader.push('Product Name')
  tableHeader.push('Price')
  tableHeader.push('Quantity')
  data.push( tableHeader )
  for( var row of results ) {
    var tableRow = []
    tableRow.push(row.id)
    tableRow.push(row.product_name)
    tableRow.push('$ ' + row.price.toFixed(2))
    tableRow.push(row.stock_quantity)
    data.push(tableRow)
  }
  var output = table(data, config)
  console.log(os.EOL+output+os.EOL)
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
      default: 0,
      filter: function(input) { return parseFloat(input) },
      validate: function(input) { return parseFloat(input) >= 0 || 'Wrong Input' },
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
      console.log(os.EOL)
      resolve(true) 
    })
  })
}

function getProducts() {
  return new Promise( function(resolve, reject) {
    conn.query('SELECT * FROM products',
      function(error, results, fields){
        if (error) reject(error)

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
    var qtyTotal = parseFloat(answers.item.qty) + parseFloat(answers.qty); // making sure it resolves to numbers
    conn.query({
      sql: 'UPDATE products SET stock_quantity=? WHERE id=?',
      values: [qtyTotal, answers.item.id]
    }, function(error, results, fields) {
      if (error) reject(error)

      console.log('\u{2705}  Quantity added.')
      resolve()
    })
  })
}

function addNewProduct() {
  return new Promise( function(resolve, reject) { 
    inquirer.prompt([{
      type: 'input',
      name: 'productName',
      message: 'Name of Product',
    },{
      type: 'input',
      name: 'price',
      message: 'Selling Price',
      filter: function(input) { return parseFloat(input) },
      validate: function(input) { return parseFloat(input) >= 0 || 'Wrong Input' },
    },{
      type: 'input',
      name: 'stockQuantity',
      message: 'Quantity',
      filter: function(input) { return parseFloat(input) },
      validate: function(input) { return parseFloat(input) >= 0 || 'Wrong Input' },
    },{
      type: 'list',
      name: 'department',
      message: 'Department',
      choices: getDepartments,
    },{
      type: 'confirm',
      name: 'confirm',
      default: false,
      message: 'Proceed',
    }]).then(async function(answers) {
      if (answers.confirm) {
        await insertProduct(answers)
      }
      console.log(os.EOL)
      resolve() 
    })
  })
}

function getDepartments() {
  return new Promise( function(resolve, reject) {
    conn.query('SELECT * FROM departments',
      function(error, results, fields){
        if (error) reject(error)

        var arr = []
        for( var row of results ) {
          arr.push({
            name: row.department_name,
            value: {id: row.id},
            short: row.department_name,
          })
        }
        resolve(arr)
      }
    )
  })
}

function insertProduct(answers) {
  return new Promise( function(resolve, reject) {
    // making sure these resolves to numbers
    var price = parseFloat(answers.price);
    var qty = parseFloat(answers.stockQuantity); 
    conn.query({
      sql: 'INSERT INTO products SET ?',
      values: {
        product_name: answers.productName,
        price: price,
        stock_quantity: qty,
        department_id: answers.department.id, 
      },
    }, function(error, results, fields) {
      if (error) reject(error)

      console.log('\u{2705}  Done adding new product with id #' + results.insertId);
      resolve()
    })
  })
}
