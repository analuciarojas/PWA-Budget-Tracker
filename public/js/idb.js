// Hold db connection 
let db;

const request = indexedDB.open("budget-tracker", 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore("new_transaction", { autoIncrement: true });
};

// Upon good request
request.onsuccess = function(event) {
    db = event.target.result;
    if (navigator.onLine) {
        //uploadtransaction();
    }
};

// Error on request 
request.onerror = function (event) {
    console.log(event.target.errorCode);
};

// Submiting new transcation 
function saveRecord(record) {
    const transaction = db.transaction(["new_transaction"], "readwrite");
    const budgetObjectStore = transaction.objectStore("new_transaction");
  
    budgetObjectStore.add(record);
}

function uploadTransaction() {

    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('new_transaction');
    const getAll = budgetObjectStore.getAll();

    // Send data to API server
    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
          fetch("/api/transaction", {
            method: "POST",
            body: JSON.stringify(getAll.result),
            headers: {
              Accept: "application/json, text/plain, */*",
              "Content-Type": "application/json",
            },
          })
            .then((response) => response.json())
            .then((serverResponse) => {
              if (serverResponse.message) {
                throw new Error(serverResponse);
              }
    
              const transaction = db.transaction(["new_transaction"], "readwrite");
              const budgetObjectStore = transaction.objectStore("new_transaction");
              budgetObjectStore.clear();
    
              alert("All saved transaction submited!");
            })
            .catch((err) => {
              console.log(err);
            });
        }
      };
    }
    
window.addEventListener("online", uploadtransaction);
    