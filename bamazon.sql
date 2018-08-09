DROP DATABASE IF EXISTS bamazon_db;
CREATE DATABASE bamazon_db;
USE bamazon_db;

CREATE TABLE departments (
  id INT NOT NULL AUTO_INCREMENT,
  department_name VARCHAR(255) NOT NULL,
  over_head_costs DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE products (
  id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INT NOT NULL,
  department_id INT,
  product_sales DECIMAL(10,2) DEFAULT 0,
  PRIMARY KEY (id),
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

INSERT INTO departments (department_name, over_head_costs) VALUES
('Electronics', 10000),
('Clothing',    60000);

INSERT INTO PRODUCTS (product_name, price, stock_quantity, department_id) VALUES
('Casual Shirt',   148, 50, 2),
('Sweater',        265, 50, 2),
('Polo Shirt',    98.5, 50, 2),
('Dress Shirt',    125, 50, 2),
('Jeans',          148, 50, 2),

('Keyboard',       1.5, 50, 1),
('Mouse',          1.5, 50, 1),
('Monitor',        1.5, 50, 1),
('Macbook Air',    1.5, 50, 1),
('Processor',      1.5, 50, 1);
