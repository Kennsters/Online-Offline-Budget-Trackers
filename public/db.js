//created db
let db
//create const request db which is opening up a new db connection (called todo, 1st version)
const request = indexedDB.open('budget', 1)

//onpugradedneeded = current db version we have does not match the one we just opened so must be upgraded
request.onupgradeneeded = event => {
    db = event.target.result
    //creating an object store, pending = all of the pending data yet to be sent to database
    db.createObjectStore('pending', { autoIncrement: true })
}

//if request is successful
request.onsuccess = event => {
    db = event.target.result

    //check to see if we are online. navigator = browser, onLine = boolean to see if we are online
    //now we want to put all the data into our database once we see that our website is online
    if (navigator.onLine) {
        //function to put all our data into our DB database
        checkDatabase()
    }
}

request.onerror = event => {
    console.log(event.target.errorCode)
}

//handle writing a function to store data into our indexed db
const saveRecord = item => {
    //opening up a new db. transaction is transfering your data into db
    const transaction = db.transaction(['pending'], 'readwrite')
    const store = transaction.objectStore('pending')
    store.add(item)
}

// const checkDatabase = () => {
//     const transaction = db.transaction(['pending'], 'readwrite')
//     const store = transaction.objectStore('pending')
//     //getting all of our items that we stored
//     const getAll = store.getAll()

//     //in the scenario if we succeed
//     getAll.onsuccess = () => {
//         //if there is stuff in the db
//         if (getAll.result.length > 0) {
            
//         }
//     }
// }

const checkDatabase = () => {
    console.log('checking database')
    const transaction = db.transaction(['pending'], 'readwrite')
    const store = transaction.objectStore('pending')
    const getAll = store.getAll()

    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(getAll.result)
            })
                .then(() => {
                    const transaction = db.transaction(['pending'], 'readwrite')
                    const store = transaction.objectStore('pending')
                    store.clear()
                })
        }
    }
}

window.addEventListener('online', checkDatabase)