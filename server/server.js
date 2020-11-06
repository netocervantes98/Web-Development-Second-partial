const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors')
const app = express()

const PORT = 3000

app.use(express.json())
app.use(cors())

mongoose.connect("mongodb://localhost:27017/my-db", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    auth: {
        authSource: "admin"
    },
    user: "username",
    pass: "password",
}).catch(e => {
    console.error(e)
})

const StoreModel = mongoose.model('StoreModel', new mongoose.Schema({
    id: String,
    name: String,
    status: String,
    contra: String,
    jugada: String,
    res: String,
}));

function saveMongo({ name, status }) {
    const id = name.replace(/\s+/g, '')
    const newRecord = new StoreModel({ id: id, name: name, status: status });
    newRecord.save(function (err) {
        if (err) return handleError(err);
    });
    return id
}

async function checkState(id) {
    actual = await findMongo(id)
    // console.log(actual)
    if (actual[0].status == "w") {
        waiting = await findWaiting()
        // console.log(waiting)
        if (waiting.length > 1) {
            StoreModel.updateOne({ id: waiting[0].id }, { status: "p", contra: waiting[1].id, jugada: "" }, function (err,) {
                if (err) return handleError(err);
            })
            StoreModel.updateOne({ id: waiting[1].id }, { status: "p", contra: waiting[0].id, jugada: "" }, function (err,) {
                if (err) return handleError(err);
            })
        }
    } if (actual[0].status == "p") {
        const jugada_actual = actual[0].jugada
        if (jugada_actual) {
            contrario = await findMongo(actual[0].contra)
            const jugada_contrario = contrario[0].jugada
            if (jugada_contrario) {
                if (jugada_contrario == jugada_actual) {
                    StoreModel.updateOne({ id: actual[0].id }, {status: "f",  res: "e", jugada: "" }, function (err,) {
                        if (err) return handleError(err);
                    })
                    StoreModel.updateOne({ id: contrario[0].id }, {status: "f",  res: "e", jugada: "" }, function (err,) {
                        if (err) return handleError(err);
                    })
                } else {
                    if ((jugada_actual == "s" && jugada_contrario == "p") || (jugada_actual == "p" && jugada_contrario == "t") || (jugada_actual == "t" && jugada_contrario == "s")) {
                        StoreModel.updateOne({ id: actual[0].id }, {status: "f",  res: "l", jugada: "" }, function (err,) {
                            if (err) return handleError(err);
                        })
                        StoreModel.updateOne({ id: contrario[0].id }, {status: "f",  res: "g", jugada: "" }, function (err,) {
                            if (err) return handleError(err);
                        })
                    } else {
                        StoreModel.updateOne({ id: actual[0].id }, {status: "f",  res: "g", jugada: "" }, function (err,) {
                            if (err) return handleError(err);
                        })
                        StoreModel.updateOne({ id: contrario[0].id }, {status: "f",  res: "l", jugada: "" }, function (err,) {
                            if (err) return handleError(err);
                        })
                    }

                }
            }
        }
        console.log(actual[0].name + " esperando")
    }
    return await findMongo(id)
}


async function findMongo(id2) {
    return StoreModel.find({ id: id2 }, 'id name status contra jugada res', function (err, doc) {
        if (err) return handleError(err);
        return doc[0]
    })
}

async function findWaiting() {
    return StoreModel.find({ status: "w" }, 'id name status', function (err, docs) {
        if (err) return handleError(err);
        return docs
    })
}

function deleteMongo() {
    StoreModel.deleteMany({}, function (err) {
        if (err) return handleError(err);
    })
}

function jugada(id, jug) {
    StoreModel.updateOne({ id: id }, { jugada: jug }, function (err,) {
        if (err) return handleError(err);
    })
}

function restart(id, jug) {
    StoreModel.updateOne({ id: id }, { status: "w", res: "", jugada: "" }, function (err,) {
        if (err) return handleError(err);
    })
}


app.post('/play', async (req, res) => {
    console.log("Saving... ")
    const id = saveMongo(req.body);

    res.send({id: id})
    console.log("completed.")
})


app.post('/status/:id', async (req, res) => {
    id = req.params.id;
    info = await checkState(id)

    res.send(info)
    console.log("Sent.")
})

app.post('/jug/:text', async (req, res) => {
    arr = req.params.text.split('-');

    if(arr[1] == "r") {
        info = await restart(arr[0])
    } else {
        info = await jugada(arr[0], arr[1])
    }

    res.send()
    console.log("get.")
})

app.get('/delete', async (req, res) => {
    deleteMongo()
    res.send()
    console.log("Deleted.")
})


app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`)
})