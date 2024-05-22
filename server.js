const inquirer = require ('inquirer');
const express = require('express');   
const routes = require('./routes');
//Importing connection pool to prevent frequent queries from slowing down the application
const {Pool} = require('pg');  
const { table } = require('console');

const PORT = process.env.PORT || 3001; 
const app = express();   

app.use(express.json()); 
app.use(routes);  

const pool = new Pool(
    {
        user: 'postgres', 
        password: 'Dxsxxd1124!', 
        host: 'localhost', 
        database: 'departments_db'
    }, 
    console.log('Connected to the departments_db database.')
) 

pool.connect();  

const mainMenu = () => {
    inquirer.prompt({
        type: 'list', 
        name: 'action', 
        message: 'What would you like to do?', 
        choices: [
            'View all departments', 
            'View all roles', 
            'View all employees', 
            'Add a department', 
            'Add a role', 
            'Add an employee', 
            'Update an employee role', 
            'Exit'
        ]
    }).then(answer => {
        switch (answer.action) {
            case 'View all departments': 
                viewDepartments(); 
                break; 
            case 'View all roles':  
                viewRoles(); 
                break; 
            case 'View all employees': 
                viewEmployees(); 
                break;
            case 'Add a department': 
                addDepartment(); 
                break; 
            case 'Add a role': 
                addRole(); 
                break; 
            case 'Add an employee': 
                addEmployee(); 
                break; 
            case 'Update an employee role': 
                updateEmployeeRole(); 
                break; 
            case 'Exit': 
                pool.end(); 
                process.exit(); 
        }
    }); 
}; 

const viewDepartments = async () => {
    const res = await pool.query('SELECT * FROM department'); 
    console.table(res.rows);
    mainMenu(); 
}; 

const viewRoles = async () => {
    const res = await pool.query(`
    SELECT roles.role_id, roles.role_title, roles.salary, departments.department_name AS department
    FROM 
    JOIN department ON roles.department_id = departments.departments_id`);
    console.table(res.rows);
    mainMenu();
}; 

const viewEmployees = async () => {
    const res = await pool.query(`
      
    `);
    console.table(res.rows.map(row => ({
      ...row,
      manager: row.manager_first_name ? `${row.manager_first_name} ${row.manager_last_name}` : 'None'
    })));
    mainMenu();
  }; 

const addDepartment = () => {
    inquirer.prompt({
        type: 'input', 
        name: 'name', 
        message: 'Enter the name of the department: '
    }).then(async answer => {
        await pool.query('INSERT INTO department (department_name) VALUES ($1)', [answer.department_name]);
        console.log(`Added department: ${answer.department_name}`); 
        mainMenu(); 
    });
}; 

const addRole = () => {
    pool.query('SELECT * FROM department').then(res => {
      const departments = res.rows.map(row => ({ name: row.name, value: row.id }));
      inquirer.prompt([
        {
          type: 'input',
          name: 'title',
          message: 'Enter the title of the role:'
        },
        {
          type: 'input',
          name: 'salary',
          message: 'Enter the salary for the role:'
        },
        {
          type: 'list',
          name: 'department_id',
          message: 'Select the department for the role:',
          choices: departments
        }
      ]).then(async answers => {
        await pool.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [answers.title, answers.salary, answers.department_id]);
        console.log(`Added role: ${answers.title}`);
        mainMenu();
      });
    });
  };
  
  const addEmployee = () => {
    Promise.all([
      pool.query('SELECT * FROM role'),
      pool.query('SELECT * FROM employee')
    ]).then(([rolesRes, employeesRes]) => {
      const roles = rolesRes.rows.map(row => ({ name: row.title, value: row.id }));
      const managers = employeesRes.rows.map(row => ({ name: `${row.first_name} ${row.last_name}`, value: row.id }));
      managers.unshift({ name: 'None', value: null });
  
      inquirer.prompt([
        {
          type: 'input',
          name: 'first_name',
          message: 'Enter the first name of the employee:'
        },
        {
          type: 'input',
          name: 'last_name',
          message: 'Enter the last name of the employee:'
        },
        {
          type: 'list',
          name: 'role_id',
          message: 'Select the role for the employee:',
          choices: roles
        },
        {
          type: 'list',
          name: 'manager_id',
          message: 'Select the manager for the employee:',
          choices: managers
        }
      ]).then(async answers => {
        await pool.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [answers.first_name, answers.last_name, answers.role_id, answers.manager_id]);
        console.log(`Added employee: ${answers.first_name} ${answers.last_name}`);
        mainMenu();
      });
    });
  };
  
  const updateEmployeeRole = () => {
    Promise.all([
      pool.query('SELECT * FROM employee'),
      pool.query('SELECT * FROM role')
    ]).then(([employeesRes, rolesRes]) => {
      const employees = employeesRes.rows.map(row => ({ name: `${row.first_name} ${row.last_name}`, value: row.id }));
      const roles = rolesRes.rows.map(row => ({ name: row.title, value: row.id }));
  
      inquirer.prompt([
        {
          type: 'list',
          name: 'employee_id',
          message: 'Select the employee to update:',
          choices: employees
        },
        {
          type: 'list',
          name: 'role_id',
          message: 'Select the new role for the employee:',
          choices: roles
        }
      ]).then(async answers => {
        await pool.query('UPDATE employee SET role_id = $1 WHERE id = $2', [answers.role_id, answers.employee_id]);
        console.log(`Updated employee's role`);
        mainMenu();
      });
    });
  };
  
  // Start the application
  mainMenu();





