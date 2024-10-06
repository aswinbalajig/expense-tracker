let currentEditExpenseId;
let currentGroup;

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
async function fetchCategories(group="personal") {
    
    try {
        let url;
        if(group==="personal"){ url= `http://127.0.0.1:8000/categories/`;  }
        else{ url=`http://127.0.0.1:8000/groups/${group}/categories/`;}
                  
        const response = await fetch(url, {
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




async function fetchExpenses(categoryId,categoryName) {
    let url='';
    if(categoryId==='all')
        url=`http://127.0.0.1:8000/records/?group_id=${currentGroup}`;
    else
    {
        url=`http://127.0.0.1:8000/categories/${categoryId}/records/`;
    }
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `JWT ${localStorage.getItem('accessToken')}`
            }
        });
        const expenses = await response.json();
        displayTable(expenses,categoryName)
    } catch (error) {
        console.error('Error fetching expenses:', error);
    }
    //note return name and expensejson to displaytable
}

async function fetchFilteredExpenses(categoryId,categoryName,fromDate,toDate)
{   let url;
    if (categoryName=="All")
    {
        url=`http://127.0.0.1:8000/records/?fromdate=${fromDate}&todate=${toDate}`;
    }
    else{
        url=`http://127.0.0.1:8000/categories/${categoryId}/records/?fromdate=${fromDate}&todate=${toDate}`;
    
    const response= await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `JWT ${localStorage.getItem('accessToken')}`
        },
    });
    if(response.ok)
    {
        const expenses=await response.json();
        displayTable(expenses,categoryName);
        pastMonth.onclick=getPastDate(categoryId,categoryName,"month");
        pastWeek.onclick=getPastDate(categoryId,categoryName,"week");


    }
    else{
        const errorData = await response.json();
        console.error('Unable to filter Expense:', errorData);
        alert('Unable to filter Expense : ' + errorData.non_field_errors[0]);
    }
}
}

async function fetchGroupNames()
{

    try {
        const url=`http://127.0.0.1:8000/groups/`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `JWT ${localStorage.getItem('accessToken')}`
            }
        });
        const groups = await response.json();
        return groups;
    } catch (error) {
        console.error('Error fetching expenses:', error);
    }

}

async function displayGroupName()
{

          const groups = await fetchGroupNames();
          const groupDropdown = document.getElementById('groupDropdown');
          const dropdownMenu = groupDropdown.nextElementSibling;
          dropdownMenu.innerHTML = ''; 
                        const createGroup = document.createElement('li');
                        const createGroupbutton=document.createElement('button');
                        createGroupbutton.className = 'dropdown-item';
                        createGroupbutton.textContent = "Create group";
                        createGroupbutton.onclick = () => createGroup();
                        createGroup.appendChild(createGroupbutton);
                        dropdownMenu.appendChild(createGroup);
                        dropdownMenu.innerHTML+='<div class="dropdown-divider"></div>';
                        const personalListItem = document.createElement('li');
                        const personalbutton=document.createElement('button');
                        personalbutton.className = 'dropdown-item';
                        personalbutton.textContent = "Personal Expenses";
                        personalbutton.onclick = () => {displaycategory();};
                        personalListItem.appendChild(personalbutton);
          dropdownMenu.appendChild(personalListItem);              
          groups.forEach(group => {
              const listItem = document.createElement('li');
              const button = document.createElement('button');
              button.className = 'dropdown-item';
              button.textContent = group.name;
              button.onclick = () => displaycategory(group.id);
              listItem.appendChild(button);
              dropdownMenu.appendChild(listItem);
          });
                        

}

async function createGroup() {

    
}


async function displaycategory(group="personal")
{         currentGroup=group;
          const categories = await fetchCategories(group);
          const categoryDropdown = document.getElementById('categoryDropdown');
          const dropdownMenu = categoryDropdown.nextElementSibling;
          dropdownMenu.innerHTML = ''; 
          const allListItem = document.createElement('li');
          const allbutton=document.createElement('button');
          allbutton.className = 'dropdown-item';
        allbutton.textContent = "All";
        allbutton.onclick = () => fetchExpenses("all","All");
        allListItem.appendChild(allbutton);
          dropdownMenu.appendChild(allListItem);
          categories.forEach(category => {
              const listItem = document.createElement('li');
              const button = document.createElement('button');
              button.className = 'dropdown-item';
              button.textContent = category.name;
              button.onclick = () => fetchExpenses(category.id,category.name);
              listItem.appendChild(button);
              dropdownMenu.appendChild(listItem);
          });
          await fetchExpenses("all","All");
}

async function displayTable(expenses,categoryName) {
    const tbody = document.querySelector('.table tbody');
    const totalPriceElement=document.querySelector('#totalpricelabel')
    totalPriceElement.innerHTML='';

    const categoryNameDisplay = document.querySelector('.currentCategory');
    categoryNameDisplay.innerHTML="";
    categoryNameDisplay.innerHTML=`<h1 class="fw-bold">${categoryName} Expenses</h1>`;


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

function callSubmitCategoryAndGroupEventListner(formId,pathName,nameElementId){
    const context=pathName==='categories'?'category':'group';
    document.getElementById(`${formId}`).addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent form submission

        const name = document.getElementById(`${nameElementId}`).value;

        try {
            let url;
            
            if (pathName==='categories')
            {
                if(currentGroup=='personal')
                {
                    url=`http://127.0.0.1:8000/${pathName}/`;
                }
                else
                {
                    url=`http://127.0.0.1:8000/groups/${currentGroup}/${pathName}/`;
                }
            }
            
            


            const response = await fetch(url, {
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
                console.error(`Unable to add ${context} `, errorData);
                alert(`Unable to add ${context} : ` + errorData.non_field_errors[0]); // Display error message
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    });

}

function callCreateGroupEventListener()
{
    document.get
}

document.addEventListener('DOMContentLoaded', async function() {

    await redirectToLogin();
    await displaycategory();
    await displayGroupName();
    await fetchExpenses("all","All");
    const categoryNameDisplay = document.querySelector('.currentCategory');
    categoryNameDisplay.innerHTML="";
    categoryNameDisplay.innerHTML='<h1 class="fw-bold">All Expenses</h1>';

    const addMoreButton = document.querySelector('.addMore');
    if (addMoreButton) {
        addMoreButton.addEventListener('click', async function addoptions() {
            const categories = await fetchCategories(currentGroup);
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
    callSubmitCategoryAndGroupEventListner('categoryForm','categories','categoryName');
    callSubmitCategoryAndGroupEventListner('groupForm','groups','groupName');
    callSubmitExpenseEventListener();
    //callSubmitCategoryEventListner();
    callSubmitEditExpenseEventListener();
    callCreateGroupEventListener();
    const pastMonth=document.querySelector(".pastMonth");
    const pastWeek=document.querySelector(".pastWeek")
    pastMonth.onclick=getPastDate("all","All","month");
    pastWeek.onclick=getPastDate("all","All","week");
}
);

function getPastDate(categoryId,categoryName,datecase) {
    const toDate = new Date(); // Current date
    const fromDate = new Date(); // Create a new date object for fromDate
    if(datecase==="week")
        fromDate.setDate(toDate.getDate() - 7);
    else if(datecase==="month")
        fromDate.setMonth(toDate.getMonth() - 1);

    // Optionally, format the dates as needed (e.g., yyyy-mm-dd)
    const formattedFromDate = fromDate.toISOString().split('T')[0];
    const formattedToDate = toDate.toISOString().split('T')[0];
    fetchFilteredExpenses(categoryId,categoryName,formattedFromDate,formattedToDate);
}

function logout()
{
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href='../html/login.html';
}