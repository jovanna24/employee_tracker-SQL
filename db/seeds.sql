-- Data to insert into the departments table 
INSERT INTO departments (department_id, department_name) VALUES 
(), 
(); 

-- Data to insert into the roles table 
INSERT INTO roles (role_id, role_title, salary) VALUES 
(), 
(); 

-- Data to insert into the employees table 
INSERT INTO employees (department_id, role_id) VALUES 
(), 
(); 

-- Query to retrieve department name, role title, and salary 
SELECT departments.department_name, roles.role_title, roles.salary 
FROM departments 
JOIN employees ON departments.department_id = employees.department_id 
JOIN roles ON employees.role_id = roles.role_id;