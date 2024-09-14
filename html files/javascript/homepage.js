let currentEditExpenseId;




async function isLoggedIn() {
    const token = localStorage.getItem('accessToken'); 
    if(token !== null)
    {  
        const request={
           headers:{'Content-Type':'application/json'},
           method:'POST',
           body:JSON.stringify({token})
         }
        let url="http://127.0.0.1:8000/auth/jwt/verify";
        const response=await fetch(url,request);
        if(response.status === 401)
        {
            return false;
        }
        return true;

    }
    return false;
    }


async function redirectToLogin() {
    if (! await isLoggedIn()) {
        window.location.href = 'login.html'; 
    }
}
async function fetchCategories() {
    try {
        const response = await fetch('http://127.0.0.1:8000/categories/', {
            headers: {
                'Authorization': `JWT ${localStorage.getItem('accessToken')}`
            }
        });
        if(response.ok)
        return await response.json();
        else{console.log(response);
            const errordata=await response.json();
            console.error(`Error : ${errordata.detail}`);}
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}
async function fetchExpenses(category) {
    let url='';
    if(category==='all')
        url='http://127.0.0.1:8000/records/'
    else
    {
        url=`http://127.0.0.1:8000/categories/${category}/records/`
    }
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `JWT ${localStorage.getItem('accessToken')}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching expenses:', error);
    }
}
async function displaycategory()
{
    const categories = await fetchCategories();
          const categoryDropdown = document.getElementById('categoryDropdown');
          const dropdownMenu = categoryDropdown.nextElementSibling;
          dropdownMenu.innerHTML = ''; 
          const allListItem = document.createElement('li');
          const allbutton=document.createElement('button');
          allbutton.className = 'dropdown-item';
        allbutton.textContent = "All";
        allbutton.onclick = () => displayTable("all","All");
        allListItem.appendChild(allbutton);
          dropdownMenu.appendChild(allListItem);
          categories.forEach(category => {
              const listItem = document.createElement('li');
              const button = document.createElement('button');
              button.className = 'dropdown-item';
              button.textContent = category.name;
              button.onclick = () => displayTable(category.id,category.name);
              listItem.appendChild(button);
              dropdownMenu.appendChild(listItem);
          });
}

async function displayTable(categoryId,categoryName) {
    const expenses = await fetchExpenses(categoryId);
    const tbody = document.querySelector('.table tbody');
    const totalPriceElement=document.querySelector('#totalpricelabel')
    totalPriceElement.innerHTML='';

    const categoryNameDisplay = document.querySelector('.currentCategory');
    categoryNameDisplay.innerHTML="";
    categoryNameDisplay.innerHTML=`<h2 class="fw-bold">${categoryName} Expenses</h2>`;


    let totalPrice = 0;

    tbody.innerHTML = ''; // Clear previous rows

    expenses.forEach((expense, index) => {
        totalPrice += parseFloat(expense.expense);
        const row = document.createElement('tr');
        //const buttonHtml=`<button class='editExpense' data-bs-toggle="modal" data-bs-target="#exampleModal"><i class="fas fa-edit"></i></button> `
        row.innerHTML = `
            <th scope="row">${index + 1}</th>
            <td>${expense.name}</td>
            <td>${expense.expense}</td>
            <td>${expense.date}</td>
            <td><button class='editExpenseButton' data-bs-toggle="modal" data-bs-target="#editExpenseModal" onclick='editExpense("${expense.name}",${expense.expense},${expense.id})'><i class="fas fa-edit"></i></button></td>
            <td><button class='deleteExpenseButton'  onclick=DeleteExpense(${expense.id},${expense.category_id})><i class="fas fa-trash"></i></button></td>

        `;

        tbody.appendChild(row);
    });
    totalPriceElement.innerHTML=`<h2>${totalPrice}</h2>`;
}

async function DeleteExpense(expenseId,categoryId)
{
    const url=`http://127.0.0.1:8000/categories/${categoryId}/records/${expenseId}/`;
    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `JWT ${localStorage.getItem('accessToken')}`
            },
        });

        if (response.ok) {
            window.location.href = 'homepage.html'; // Change to your homepage
        } else {
            const errorData = await response.json();
            console.error('Unable to Delete Expense:', errorData);
            alert('Unable to Delete Expense : ' + errorData.non_field_errors[0]); // Display error message
        }
    } catch (error) {
        console.error('Error:', error.detail);
        alert('An error occurred. Please try again.');
    }

}
function editExpense(name,expense,id)
{
           
            const formElement=document.getElementById("editExpenseForm");
            const nameElement=formElement.querySelector("#Name");
            const expenseElement=formElement.querySelector("#Expense");
            nameElement.value=name;
            expenseElement.value=expense;
            currentEditExpenseId=id; 
}

function callSubmitEditExpenseEventListener()
{
    document.querySelector("#editExpenseForm").addEventListener('submit',

        async function(event)
        {   
            event.preventDefault();
            const formElement=document.getElementById("editExpenseForm");
            if(formElement){
            const name=formElement.querySelector("#Name").value;
            const expense=formElement.querySelector("#Expense").value;

            try{

                const response=await fetch(`http://127.0.0.1:8000/records/${currentEditExpenseId}/`,
                    {
                        method:'PATCH',
                        headers:{
                            'Content-Type' : 'application/json' ,
                            'Authorization' : `JWT ${localStorage.getItem('accessToken')}`
                        },
                        body : JSON.stringify({name,expense})
                    }
                );

                if(response.ok)
                {
                    currentEditExpenseId=null;
                    window.location.href="../html/homepage.html"
                }
                else{
                    const errorData=await response.json();
                    console.error("Unable to Edit: ",erroData);
                    alert('Unable to edit Expense :'+ errorData.non_field_errors[0]);
                }

            }
            catch(error){
                console.error('Error : ',error);
                alert('An error occured please try again..');
            }
        }
        else{console.error("Form element not found");}
        }

    );
}

function callSubmitExpenseEventListener(){
    const expenseFormController = new AbortController();
    document.getElementById('expenseform').addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent form submission

        const name = document.getElementById('Name').value;
        const expense = document.getElementById('Expense').value;
        const category=document.getElementById('expenseCategory').value;

        try {
            if(expense<0)
            {
                throw new Error("price should be greater than zero");
            }
            const response = await fetch(`http://127.0.0.1:8000/categories/${category}/records/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `JWT ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({ name, expense }), // same as {email:email,password:password}
            });

            if (response.ok) {
                window.location.href = '../html/homepage.html'; // Change to your homepage
            } else {
                const errorData = await response.json();
                console.error('Unable to add Expense:', errorData);
                alert('Unable to add Expense : ' + errorData.non_field_errors[0]); // Display error message
            }
        } catch (error) {
            alert(` Please try again.  ${error}`);
        }
    } , 
    { signal: expenseFormController.signal }

);

}

function callSubmitCategoryEventListner(){

    document.getElementById('categoryForm').addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent form submission

        const name = document.getElementById('categoryName').value;

        try {
            const response = await fetch(`http://127.0.0.1:8000/categories/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `JWT ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({ name }), // same as {email:email,password:password}
            });

            if (response.ok) {
                window.location.href = 'homepage.html'; // Change to your homepage
            } else {
                const errorData = await response.json();
                console.error('Unable to add expense', errorData);
                alert('Unable to add expense : ' + errorData.non_field_errors[0]); // Display error message
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    });

}

document.addEventListener('DOMContentLoaded', async function() {
    await redirectToLogin();
    await displaycategory();
    await displayTable("all","All");
    const categoryNameDisplay = document.querySelector('.currentCategory');
    categoryNameDisplay.innerHTML="";
    categoryNameDisplay.innerHTML='<h1 class="fw-bold">All Expenses</h1>';

    const addMoreButton = document.querySelector('.addMore');
    if (addMoreButton) {
        addMoreButton.addEventListener('click', async function addoptions() {
            const categories = await fetchCategories();
            const dropdown = document.querySelector('#expenseCategory');
            if(dropdown)
            {
                dropdown.innerHTML = '';
            categories.forEach(
                (category) => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                dropdown.appendChild(option);
            });
            }
            else{console.error('expense category not found');}
        
    });
    } 
    else {
        console.error('Add More button not found.');
    }
    callSubmitExpenseEventListener();
    callSubmitCategoryEventListner();
    callSubmitEditExpenseEventListener();
}
);



function logout()
{
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href='../html/login.html';
}