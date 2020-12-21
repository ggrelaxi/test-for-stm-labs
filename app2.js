const app = () => {
    
    // Основные блоки

    const usersBlock = document.getElementById("users");
    const filter = document.getElementById("userFilter");
    const refreshButton = document.getElementById("refreshButton");

    // адрес сервера

    const serverUrl = "https://randomuser.me/api/?results=15";

    // Общее состояние, включающее в себя данные и параметры фильтрации

    const state = {
        form: {
            state: 'download',
        },

        data: null,
        error: null,
        filter: "",
    }

    // Декоратор

    const debounce = (fn, ms) => {

        let timeout;
        
        return function() {
            const functionCall = () => {
                return fn.apply(this, arguments);
            };

            clearTimeout(timeout);
            timeout = setTimeout(functionCall, ms);
        }
    };

    // Обработчик поля ввода фильтра

    let filterOut = (event) => {
        state.filter = event.target.value;
        renderFilteredUsers(filterUsers(state.data, state.filter));
    }

    filterOut = debounce(filterOut, 500);

    filter.addEventListener("keyup", filterOut);

    // Обработчик кнопки сброса

    refreshButton.addEventListener("click", () => {
        state.filter = "";
        renderUsers(state.data, state.filter);
    });

    // Основной рендер. В зависимости от состояния формы, рисует нам соответствующее представление

    const render = (state) => {
        if (state.form.state === "download") {
            filter.disabled = true;
            refreshButton.disabled = true;

            const progressBlock = document.createElement('div');
            progressBlock.classList.add("progressBlock");

            const spinner = document.createElement("span");
            spinner.classList.add("spinner");

            const downloadMessage = document.createElement("span");
            downloadMessage.innerHTML = "Download data";
            downloadMessage.classList.add("message");

            progressBlock.appendChild(spinner);
            progressBlock.appendChild(downloadMessage);

            usersBlock.appendChild(progressBlock);
        }

        if (state.form.state === "data ready") {
            filter.disabled = false;
            refreshButton.disabled = false;
            usersBlock.innerHTML = "";
            usersBlock.appendChild(createTable());
            
            renderUsers(state.data);
        }

        if (state.form.state === "data filtered") {
            filter.disabled = false;
            refreshButton.disabled = false;

            const actualUsersLists = filterUsers(state.data, state.filter);
            
            renderFilteredUsers(actualUsersLists);
        }

        if (state.form.state === "error") {
            filter.disabled = true;
            refreshButton.disabled = true;

            const errorMessage = document.createElement("span");
            errorMessage.classList.add("error");
            errorMessage.innerHTML = state.form.error;

            usersBlock.innerHTML = "";
            usersBlock.appendChild(errorMessage);
        }
    }

    // Функция загрузки списка пользователей с свервера

    const getData = (url) => {
        let xhr = new XMLHttpRequest();

        xhr.open("GET", url)
        xhr.setRequestHeader("Content-Type", "application/json")

        xhr.onload = function() {
            if (xhr.status === 200 || xhr.status === 204) {
                let response = JSON.parse(xhr.response)
                state.data = response.results;
                state.form.state = "data ready";
            }
            if (xhr.status === 404) {
                state.form.state = "error"
                state.form.error = "server url is incorrect";
            }
            if (xhr.status === 500) {
                state.form.state = "error"
                state.form.error = "internal server error, try again later";
            }
            
            render(state);
        }

        xhr.error = function () {
            state.form.state = "error"
            state.form.error = "internal server error, try again later";

            render(state);
        }

        xhr.send();
    }

    // Создаем заготовку таблицы для вывода пользователей, заполняем строку-заголовок

    const createTable = () => {
        const table = document.createElement("table");
        table.setAttribute("id", "resultTable");

        const thead = document.createElement("thead");
        const tr = document.createElement("tr");

        const thName = document.createElement("th");
        thName.innerHTML = "Name";

        const thPicture = document.createElement("th");
        thPicture.innerHTML = "Picture";

        const thLocation = document.createElement("th");
        thLocation.innerHTML = "Location"

        const thEmail = document.createElement("th");
        thEmail.innerHTML = "Email";

        const thPhone = document.createElement("th");
        thPhone.innerHTML = 'Phone';

        const thRegisteredDate = document.createElement("th");
        thRegisteredDate.innerHTML = "Registered date";

        const tbody = document.createElement("tbody");

        tbody.setAttribute("id", "tbody");

        tr.appendChild(thName);
        tr.appendChild(thPicture);
        tr.appendChild(thLocation);
        tr.appendChild(thEmail);
        tr.appendChild(thPhone);
        tr.appendChild(thRegisteredDate);

        thead.appendChild(tr);

        table.appendChild(thead);
        table.appendChild(tbody)

        return table;
    }

    // Новая версия фильтрации пользователей. Теперь для пользователя, который подходит под условия фильтра, сохраняем номер его строки в стейт.

    const filterUsers = (users, filter) => {
        const usersNumber = [];
        for (let i = 0; i < users.length; i++) {
            let userFirstName = users[i].name.first;
            let userLastName = users[i].name.last;
            if (filter === "") {
                usersNumber.push(i);
            } else if (userFirstName.indexOf(filter) !== -1 || userLastName.indexOf(filter) !== -1) {
                usersNumber.push(i);
            };
        };

        console.log(usersNumber)

        return usersNumber;
    };

    // форматирование даты

    const formatDate = (date) => {
        let dd = date.getDate();
        if (dd < 10) {
            dd = `0${dd}`;
        }

        let mm = date.getMonth() + 1;
        if (mm < 10) {
            mm = `0${mm}`
        }

        let yy = date.getFullYear();

        return `${dd}.${mm}.${yy}`;
    };

    // Рендер пользователей в таблицу - делаем первую отрисовку в DOM, полученного списка пользователей

    const renderUsers = (users) => {
        const tbody = document.getElementById("tbody");
        tbody.innerHTML = "";

        if (users.length === 0) {
            const trMessageRow = document.createElement("tr");
            const trMessageTd = document.createElement("td");
            trMessageTd.setAttribute("colspan", "6");
            trMessageTd.innerHTML = "No match found. Try change filter options.";
            
            trMessageRow.appendChild(trMessageTd);
            tbody.appendChild(trMessageRow);
        }

        users.forEach(user => {
            const tr = document.createElement("tr");

            const tdName = document.createElement("td");
            tdName.innerHTML = `${user.name.first} ${user.name.last}`;

            const tdPicture = document.createElement("td");
            const pictureContainer = document.createElement("div");
            pictureContainer.classList.add("img-container");
            const userImg = document.createElement("img");
            userImg.src = user.picture.thumbnail;
            pictureContainer.appendChild(userImg);

            const fullUserImg = document.createElement("img");
            fullUserImg.src = user.picture.large;
            fullUserImg.classList.add("full");
            pictureContainer.appendChild(fullUserImg);
            tdPicture.appendChild(pictureContainer);

            const userLocation = document.createElement("td");
            userLocation.innerHTML = `${user.location.state}, ${user.location.city}`;

            const userEmail = document.createElement("td");
            userEmail.innerHTML = user.email;

            const userPhone = document.createElement("td");
            userPhone.innerHTML = user.phone;

            const userRegDate = document.createElement("td");
            const date = new Date(user.dob.date);
            userRegDate.innerHTML = formatDate(date);

            tr.appendChild(tdName);
            tr.appendChild(tdPicture);
            tr.appendChild(userLocation);
            tr.appendChild(userEmail);
            tr.appendChild(userPhone);
            tr.appendChild(userRegDate);

            tbody.appendChild(tr);
        });

        const trMessageRow = document.createElement("tr");
        trMessageRow.style.display = "none";
        trMessageRow.setAttribute("id", "table-message");
        const trMessageTd = document.createElement("td");
        trMessageTd.setAttribute("colspan", "6");
        trMessageTd.innerHTML = "No match found. Try change filter options.";
        
        trMessageRow.appendChild(trMessageTd);

        tbody.appendChild(trMessageRow);

    };

    // Рендер пользователей по условию фильтра. Теперь он не меняет DOM, а скрывает лишние строки через CSS
    
    const renderFilteredUsers = (users) => {

        
        const trList = document.getElementById("tbody").querySelectorAll("tr");

        if (users.length === 0) {
            for (let i = 0; i < trList.length; i ++) {
                trList[i].style.display = "none";
            }

            const trMessage = document.getElementById("table-message");
            trMessage.style.display = "table-row";
        } else {        
            for (let i = 0; i < trList.length; i ++) {
                if (users.indexOf(i) === -1) {
                    trList[i].style.display = "none";
                } else {
                    trList[i].style.display = "table-row";
                };
            };
        };
    };

    // Получаем данные с сервера

    try {
        getData(serverUrl);
        render(state);
    } catch (error) {
        state.form.state = "error";
        state.errorMessage = error;
        render(state);
    }
};


app();