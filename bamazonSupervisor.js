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
    'View Product Sales by Department',
    'Create New Department',
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

        for( var row of results ) {
          console.log(`${row.department_id} ${row.department_name} ${row.over_head_costs} ${row.product_sales} ${row.total_profit}`)
        }
        resolve(true)
      }
    )
  })
}