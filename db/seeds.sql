-- Data to insert into the departments table 
INSERT INTO departments (department_id, department_name) VALUES 
(1, 'Department 1'), 
(2, 'Department 2'); 

-- Data to insert into the roles table 
INSERT INTO roles (role_id, role_title, salary, department_id) VALUES 
(1, 'manager', 523, 1), 
(2, 'tech', 545, 2); 

-- Data to insert into the employees table 
INSERT INTO employees (employee_id, first_name, last_name, role_id, manager_id) VALUES 
(1, 'John', 'Smith', 1, null), 
(2, 'Jane', 'Smith', 2, 1); 

-- Query to retrieve department name, role title, and salary 
-- SELECT departments.department_name, roles.role_title, roles.salary 
-- FROM departments 
-- JOIN employees ON departments.department_id = employees.department_id 
-- JOIN roles ON employees.role_id = roles.role_id;