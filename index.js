const inquirer = require('inquirer');
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'MOL628826',
    database: 'employee_tracker'
});

db.connect(err => {
    if (err) throw err;
    console.log('Database connected.');
    startApp();
});

function startApp() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                'View All Departments',
                'View All Roles',
                'View All Employees',
                'Add a Department',
                'Add a Role',
                'Add an Employee',
                'Update Employee Role',
                'Exit'
            ]
        }
    ]).then(answer => {
        switch (answer.action) {
            case 'View All Departments':
                viewAllDepartments();
                break;
            case 'View All Roles':
                viewAllRoles();
                break;
            case 'View All Employees':
                viewAllEmployees();
                break;
            case 'Add a Department':
                addDepartment();
                break;
            case 'Add a Role':
                addRole();
                break;
            case 'Add an Employee':
                addEmployee();
                break;
            case 'Update Employee Role':
                updateEmployeeRole();
                break;
            case 'Exit':
                db.end();
                break;
        }
    });
}

function viewAllDepartments() {
    const query = 'SELECT * FROM department';
    db.query(query, (err, results) => {
        if (err) throw err;
        console.table(results);
        startApp();
    });
}

function viewAllRoles() {
    const query = `
        SELECT role.id, role.title, role.salary, department.name AS department
        FROM role
        INNER JOIN department ON role.department_id = department.id
    `;
    db.query(query, (err, results) => {
        if (err) throw err;
        console.table(results);
        startApp();
    });
}

function viewAllEmployees() {
    const query = `
        SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
        FROM employee
        LEFT JOIN role ON employee.role_id = role.id
        LEFT JOIN department ON role.department_id = department.id
        LEFT JOIN employee manager ON manager.id = employee.manager_id
    `;
    db.query(query, (err, results) => {
        if (err) throw err;
        console.table(results);
        startApp();
    });
}

function addDepartment() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Enter the name of the department:'
        }
    ]).then(answer => {
        const query = 'INSERT INTO department (name) VALUES (?)';
        db.query(query, answer.name, (err, results) => {
            if (err) throw err;
            console.log('Department added.');
            startApp();
        });
    });
}

function addRole() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'Enter the title of the role:'
        },
        {
            type: 'input',
            name: 'salary',
            message: 'Enter the salary of the role:'
        },
        {
            type: 'input',
            name: 'department_id',
            message: 'Enter the department ID for the role:'
        }
    ]).then(answers => {
        const query = 'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)';
        db.query(query, [answers.title, answers.salary, answers.department_id], (err, results) => {
            if (err) throw err;
            console.log('Role added.');
            startApp();
        });
    });
}

function addEmployee() {
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
            type: 'input',
            name: 'role_id',
            message: 'Enter the role ID of the employee:'
        },
        {
            type: 'input',
            name: 'manager_id',
            message: 'Enter the manager ID of the employee (or NULL if no manager):'
        }
    ]).then(answers => {
        const query = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)';
        db.query(query, [answers.first_name, answers.last_name, answers.role_id, answers.manager_id], (err, results) => {
            if (err) throw err;
            console.log('Employee added.');
            startApp();
        });
    });
}

function updateEmployeeRole() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'employee_id',
            message: 'Enter the ID of the employee whose role you want to update:'
        },
        {
            type: 'input',
            name: 'role_id',
            message: 'Enter the new role ID for the employee:'
        }
    ]).then(answers => {
        const query = 'UPDATE employee SET role_id = ? WHERE id = ?';
        db.query(query, [answers.role_id, answers.employee_id], (err, results) => {
            if (err) throw err;
            console.log('Employee role updated.');
            startApp();
        });
    });
}
