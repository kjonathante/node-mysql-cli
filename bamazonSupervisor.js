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
  //console.log( arguments )
  // start app
  main()
})

async function main() {
  var mainMenu = [
    'View Product Sales by Department',
    'Create New Department',
    'Exit',
  ];

  var answers;
  do {
    answers = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'Supervisor Menu > ',
      choices: mainMenu,
      prefix: '\uD83D\uDDC4\uFE0F ',
    }])

    switch (answers.action) {
      case 'View Product Sales by Department':
        await viewProductSales();
        break;
      case 'Create New Department':
        // await viewLowInventory();
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

function viewProductSales() {
  return new Promise( function(resolve, reject) {
    conn.query(
      `SELECT departments.id department_id, department_name, 
      over_head_costs, sum(product_sales) product_sales,
      sum(product_sales) - over_head_costs total_profit
      FROM departments 
      LEFT JOIN products 
      ON departments.id=products.department_id 
      GROUP BY departments.id`,
      function(error, results, fields){
        if (error) throw reject(error)
        printTable(results)
        resolve(true)
      }
    )
  })
}

function printTable(results) {
  var data = []

  var config = {
    columns: {
      2: {
        alignment: 'right',
      },
      3: {
        alignment: 'right',
      },
      4: {
        alignment: 'right',
      }
    }
  }

  var tableHeader = []
  tableHeader.push('Department ID')
  tableHeader.push('Department Name')
  tableHeader.push('Overhead Costs')
  tableHeader.push('Product Sales')
  tableHeader.push('Total Profit')
  data.push( tableHeader )

for( var row of results ) {
    var tableRow = []
    tableRow.push(row.department_id)
    tableRow.push(row.department_name)
    tableRow.push(row.over_head_costs.toFixed(2))
    tableRow.push(row.product_sales.toFixed(2))
    tableRow.push(row.total_profit.toFixed(2))

    data.push( tableRow )
  }
  var output = table(data, config)
  console.log(os.EOL+output+os.EOL)
}