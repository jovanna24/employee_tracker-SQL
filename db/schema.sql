DROP DATABASE IF EXISTS departments_db;
CREATE DATABASE departments_db;

\c departments_db;

-- Creating the departments table
CREATE TABLE departments (
  department_id SERIAL PRIMARY KEY,
  department_name VARCHAR(30) NOT NULL
);

-- Creating the roles table
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_title VARCHAR(30) NOT NULL,
    salary DECIMAL NOT NULL,
    department_id INTEGER NOT NULL, 
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
); 

-- Creating the employees table 
CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY, 
    first_name VARCHAR (30) NOT NULL, 
    last_name VARCHAR (30) NOT NULL, 
    role_id INTEGER NOT NULL, 
    manager_id INTEGER, 
    FOREIGN KEY (role_id) REFERENCES roles(role_id), 
    FOREIGN KEY (manager_id) REFERENCES managers(manager_id)
);

