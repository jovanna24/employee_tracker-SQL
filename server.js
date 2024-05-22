const inquirer = require ('inquirer');
//Importing connection pool to prevent frequent queries from slowing down the application
const {Pool} = require('pg');  
const { table } = require('console');

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
    const res = await pool.query('SELECT * FROM departments'); 
    console.table(res.rows);
    mainMenu(); 
}; 

const viewRoles = async () => {
    const res = await pool.query(`
    SELECT roles.role_id, roles.role_title, roles.salary, departments.department_name AS department
    FROM roles JOIN departments ON roles.department_id = departments.department_id;`);
    console.table(res.rows);
    mainMenu();
}; 

const viewEmployees = async () => {
    const res = await pool.query(`SELECT employees.employee_id, employees.first_name, employees.last_name, roles.salary, roles.role_title, CONCAT(managers.first_name, ' ', managers.last_name) AS manager FROM employees JOIN roles ON employees.role_id = roles.role_id LEFT JOIN employees AS managers ON employees.manager_id = managers.employee_id;`);
    console.table(res.rows)
    mainMenu();
  }; 

const addDepartment = () => {
    inquirer.prompt({
        type: 'input', 
        name: 'name', 
        message: 'Enter the name of the department: '
    }).then(answer => {
        pool.query('INSERT INTO departments (department_name) VALUES ($1)', [answer.name])
        .then (()=>{
          console.log(`Added department: ${answer.name}`); 
          mainMenu();
        })
        .catch(error => {
          if (error.code === '23505') {
            console.error('Error: Duplicate department id detected');
          } else {
            console.error('Error inserting department: ', error); 
          }
          mainMenu();
        })
        
        
        // mainMenu(); 
    });
}; 

const addRole = () => {
    pool.query('SELECT * FROM departments')
      .then(res => {
      const departments = res.rows.map(row => ({ 
        name: row.department_name, 
        value: row.department_id 
      }));
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
        pool.query('INSERT INTO roles (role_title, salary, department_id) VALUES ($1, $2, $3)', 
        [answers.title, answers.salary, answers.department_id]);
        console.log(`Added role: ${answers.role_title}`);
        mainMenu();
      })
      .catch(error => {
        if (error.code === '23505') {
          console.error('Error: Duplicate role id detected');
        } else {
          console.error('Error inserting role: ', error);
        } 
        mainMenu();
      });
    });
  };
  
  const addEmployee = () => {
    Promise.all([
      pool.query('SELECT * FROM roles'),
      pool.query('SELECT * FROM employees')
    ]).then(([rolesRes, employeesRes]) => {
      const roles = rolesRes.rows.map(row => ({ name: row.role_title, value: row.role_id }));
      const managers = employeesRes.rows.map(row => ({ name: `${row.first_name} ${row.last_name}`, value: row.role_title }));
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
      ]).then( answers => {
         pool.query('INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', 
         [answers.first_name, answers.last_name, answers.role_id, answers.manager_id])
         .then(()=> {
          console.log(`Added employee: ${answers.first_name} ${answers.last_name}`);
          mainMenu();
         })
        .catch(error => {
          console.error('Error inserting employee: ', error);
          mainMenu();
        });
      }).catch(error =>{
        console.error('Error during prompt:', error); 
        mainMenu();
      });
    }).catch(error => {
      console.error('Error fetching roles for employees: ', error);
      mainMenu();
    });
  };
  
  const updateEmployeeRole = () => {
    Promise.all([
      pool.query('SELECT * FROM employees'),
      pool.query('SELECT * FROM roles')
    ]).then(([employeesRes, rolesRes]) => {
      const employees = employeesRes.rows.map(row => ({ name: `${row.first_name} ${row.last_name}`, value: row.employee_id }));
      const roles = rolesRes.rows.map(row => ({ name: row.role_title, value: row.role_id }));
  
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
      ]).then(answers => {
         pool.query('UPDATE employees SET role_id = $1 WHERE employee_id = $2', 
         [answers.role_id, answers.employee_id])
         .then(()=> {
            console.log(`Updated employee's role`);
            mainMenu();
      })
      .catch(error => {
        console.error('Error updating employee role: ', error);
        mainMenu();
      }); 
    }).catch(error =>{
      console.error('Error during prompt: ', error); 
      mainMenu();
    });
  }).catch(error =>{
    console.error('Error fetching employee roles: ', error); 
    mainMenu();
  }); 
};
  
  // Start the application
  mainMenu();





