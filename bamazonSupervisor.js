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
        await addNewDepartment();
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
      over_head_costs, COALESCE(SUM(product_sales),0) product_sales,
      COALESCE(SUM(product_sales),0) - over_head_costs total_profit
      FROM departments 
      LEFT JOIN products 
      ON departments.id=products.department_id 
      GROUP BY departments.id`,
      function(error, results, fields){
        if (error) reject(error)
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


function addNewDepartment() {
  return new Promise( function(resolve, reject) { 
    inquirer.prompt([{
      type: 'input',
      name: 'departmentName',
      message: 'Name of Department',
    },{
      type: 'input',
      name: 'overheadCosts',
      message: 'Estimated Overhead Costs',
      filter: function(input) { return parseFloat(input) },
      validate: function(input) { return parseFloat(input) >= 0 || 'Wrong Input' },
    },{
      type: 'confirm',
      name: 'confirm',
      default: false,
      message: 'Proceed',
    }]).then(async function(answers) {
      if (answers.confirm) {
        await insertDepartment(answers)
      }
      console.log(os.EOL)
      resolve() 
    })
  })
}

function insertDepartment(answers) {
  return new Promise( function(resolve, reject) {
    // making sure these resolves to numbers
    var overheadCosts = parseFloat(answers.overheadCosts);
    conn.query({
      sql: 'INSERT INTO departments SET ?',
      values: {
        department_name: answers.departmentName,
        over_head_costs: overheadCosts,
      },
    }, function(error, results, fields) {
      if (error) reject(error)
      console.log('\u{2705}  Done adding new department with id #' + results.insertId);
      resolve()
    })
  })
}