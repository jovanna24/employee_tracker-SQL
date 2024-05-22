SELECT departments.department_name AS department, roles.role_title AS role
FROM roles 
LEFT JOIN departments ON roles.department_id = departments.department_id
