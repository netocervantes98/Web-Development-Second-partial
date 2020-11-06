let conn;
try {
    conn = new Mongo("127.0.0.1:27017"); // check the port from above
} catch (err) {
    print(err)
}

while (conn === undefined) {
    try {
        conn = new Mongo("127.0.0.1:27017");
    }
    catch (err) {
        print(err)
    }
    sleep(100);
}

var db = conn.getDB("my-db");

if (db.users) {
    print("dropping")
    db.users.drop()
}
print("creating")
db.createCollection("users", {
    autoIndexId: true,
})

print("created")
print(db.users)

db.users.insert({ username: "username", password: "secret" })