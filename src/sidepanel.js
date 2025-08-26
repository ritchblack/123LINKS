import "./sidepanel.css";

document.addEventListener("DOMContentLoaded", function () {
  let linkListArray = [];
  var maxTasks = 3; // Default max tasks
  const todoInput = document.querySelector("#todoInput");
  const addButton = document.querySelector("#addButton");
  const todoList = document.querySelector("#todoList");
  const maxSettings = document.querySelector("#maxSettings");
  chrome.storage.sync.get("maxTasks", function (data) {
    if (data.maxTasks) {
      maxTasks = data.maxTasks; // Set max tasks from storage
    }
    document
      .querySelector(`[data-max="${maxTasks}"]`)
      .classList.add("selected");
  });

  // document.querySelector(`[data-max="${maxTasks}"]`).classList.add('selected');
  chrome.storage.sync.get("linkList_123", function (data) {
    if (data.linkList_123) {
      linkListArray = JSON.parse(data.linkList_123);
      linkListArray.forEach(function (todoItem) {
        const newTodo = document.createElement("li");
        const todoText = escapeHtml(todoItem.task);
        const isChecked = todoItem.isChecked;
        const link = todoItem.link;
        newTodo.classList.add("todoItem");

        if (link != "") {
          newTodo.innerHTML = `
                    <label class="todoTitle">
                    <input class="todoCheck" type="checkbox">
                    <p><a href="${link}" target="_blank">${todoText}</a></p>
                    </label>
                    <button class="deleteButton">X</button>
                `;
        } else {
          newTodo.innerHTML = `
                    <label class="todoTitle">
                    <input class="todoCheck" type="checkbox">
                    <p>${todoText}</p>
                    </label>
                    <button class="deleteButton">X</button>
                `;
        }
        if (isChecked) {
          newTodo.querySelector(".todoCheck").checked = true;
          newTodo.classList.add("completed");
        }
        todoList.appendChild(newTodo);
      });
    }
  });

  addButton.addEventListener("click", function () {
    const todoText = todoInput.value.trim();
    if (linkListArray.length == maxTasks) {
      alert(`You can only add up to ${maxTasks} tasks.`);
      return;
    }

    if (todoText) {
      // 新增 todo
      const newTodo = document.createElement("li");
      const textAdded = escapeHtml(todoText);
      let link = "";
      try {
        new URL(textAdded);
        link = textAdded;
      } catch (e) {
        link = "";
      }
      newTodo.classList.add("todoItem");
      newTodo.classList.add("animate-right");

      // newTodo.classList.add('animate-fadeout');
      if (link) {
        newTodo.innerHTML = `
                <label class="todoTitle">
                <input class="todoCheck" type="checkbox">
                <p><a href="${link}" target="_blank">${textAdded}</a></p>
                </label>
                <button class="deleteButton">X</button>
            `;
      } else {
        newTodo.innerHTML = `
                <label class="todoTitle">
                <input class="todoCheck" type="checkbox">
                <p>${textAdded}</p>
                </label>
                <button class="deleteButton">X</button>
            `;
      }

      todoList.appendChild(newTodo);
      todoInput.value = "";
      linkListArray.push({ task: textAdded, link: "", isChecked: false }); // 將新 todo 加入陣列
      chrome.storage.sync.set(
        { linkList_123: JSON.stringify(linkListArray) },
        function () {
          console.log(
            `Todo list ${JSON.stringify(linkListArray)} saved to storage.`
          );
        }
      );
    } else {
      alert("Please enter a task.");
    }
  });

  // Add event listener for pressing Enter key
  todoInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      addButton.click(); // Trigger the button click
    }
  });

  todoList.addEventListener("click", function (event) {
    const target = event.target;
    // 刪除 todo
    if (target.classList.contains("deleteButton")) {
      const todoItem = target.closest(".todoItem");
      todoList.removeChild(todoItem);
      linkListArray = linkListArray.filter(
        (item) => item.task !== target.previousElementSibling.textContent.trim()
      );
      chrome.storage.sync.set(
        { linkList_123: JSON.stringify(linkListArray) },
        function () {
          console.log(
            `Todo list ${JSON.stringify(linkListArray)} saved to storage.`
          );
        }
      );
    } else if (target.classList.contains("todoCheck")) {
      const todoItem = target.closest(".todoItem");
      const todoChecked = linkListArray.find(
        (element) =>
          element.task === todoItem.querySelector("p").textContent.trim()
      );
      todoChecked.isChecked = target.checked; // 更新 isChecked 屬性
      chrome.storage.sync.set(
        { linkList_123: JSON.stringify(linkListArray) },
        function () {
          console.log(
            `Todo list ${JSON.stringify(linkListArray)} saved to storage.`
          );
        }
      );
      if (target.checked) {
        todoItem.classList.add("completed");
      } else {
        todoItem.classList.remove("completed");
      }
    }
  });
  maxSettings.addEventListener("click", function (event) {
    const target = event.target;
    if (target.dataset) {
      if (maxTasks == parseInt(target.dataset.max)) {
        return;
      }
      document
        .querySelector(`[data-max="${maxTasks}"]`)
        .classList.remove("selected");
      target.classList.add("selected");
      switch (target.dataset.max) {
        case "3":
          maxTasks = 3;
          break;
        case "5":
          maxTasks = 5;
          break;
        case "7":
          maxTasks = 7;
          break;
        default:
          break;
      }
      chrome.storage.sync.set({ maxTasks: maxTasks }, function () {
        console.log(`Max tasks set to ${maxTasks}.`);
      });
      if (linkListArray.length > maxTasks) {
        linkListArray = linkListArray.slice(0, maxTasks); // 限制 linkListArray 的長度
        while (todoList.childElementCount > maxTasks) {
          todoList.removeChild(todoList.lastChild); // 刪除多餘的 todo
        }
      }
    }
  });
  chrome.runtime.onMessage.addListener((item, sender, sendResponse) => {
    console.log("Message received in sidepanel:", item);

    let link = item.pageUrl;
    let textAdded = "";
    if (item.selectionText) {
      try {
        new URL(item.selectionText);
        link = item.selectionText;
      } catch (e) {
        console.log("Invalid URL in selection text, using page URL instead.");
      }
      textAdded = escapeHtml(item.selectionText.trim());
    } else if (item.linkUrl) {
      textAdded = escapeHtml(item.linkUrl);
      link = item.linkUrl;
    } else {
      textAdded = escapeHtml(item.pageUrl);
    }

    const newTodo = document.createElement("li");

    newTodo.classList.add("todoItem");
    newTodo.classList.add("animate-right");

    newTodo.innerHTML = `
                <label class="todoTitle">
                <input class="todoCheck" type="checkbox">
                <p><a href="${link}" target="_blank">${textAdded}</a></p>
                </label>
                <button class="deleteButton">X</button>
            `;

    todoList.appendChild(newTodo);
    linkListArray.push({ task: textAdded, link: link, isChecked: false }); // 將新 todo 加入陣列
    chrome.storage.sync.set(
      { linkList_123: JSON.stringify(linkListArray) },
      function () {
        console.log(
          `link list ${JSON.stringify(linkListArray)} saved to storage.`
        );
      }
    );

    sendResponse({ status: "Message received" });
  });
});

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
