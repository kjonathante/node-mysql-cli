DROP DATABASE IF EXISTS bamazon_db;
CREATE DATABASE bamazon_db;
USE bamazon_db;

CREATE TABLE products (
  id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(255) NOT NULL,
  department_name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INT NOT NULL,
  PRIMARY KEY (id)
);

INSERT INTO PRODUCTS (product_name, department_name, price, stock_quantity) VALUES
('Glue', 'School', 1.5, 50),
('Composition Notebook', 'School', 1.5, 50),
('Pencil Case', 'School', 1.5, 50),
('Glue', 'School', 1.5, 50);