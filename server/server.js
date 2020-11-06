const mongoose = require('mongoose')
const express = require('express')
const axios = require('axios')
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
    info: Object
}));

function saveMongo(id, info) {
    const newRecord = new StoreModel({ id: id, info: info });
    newRecord.save(function (err) {
        if (err) return handleError(err);
    });
}

async function updateMongo(id, info) {
    actual = await findMongo(id)
    StoreModel.updateOne({ id: id }, { info: { ...actual[0].info, ...info } }, function (err,) {
        if (err) return handleError(err);
    })
}

function deleteMongo(id) {
    StoreModel.deleteMany({ id: id }, function (err) {
        if (err) return handleError(err);
    })
}

async function findAllMongo() {
    return StoreModel.find(function (err, docs) {
        if (err) return handleError(err);
        return docs.map(x => x.info)
    })
}

async function findMongo(id) {
    return StoreModel.find({ id: id }, 'id info', function (err, doc) {
        if (err) return handleError(err);
        return doc[0]
    })
}

app.get('/get/:id', async (req, res) => {
    let id = 0;
    id = parseInt(req.params.id);
    info = await findMongo(id)

    if (info.length) {
        console.log("Info is in cache.")
        info = info[0].info
    } else {
        console.log("Info is not in cache. Asking pokeapi...")

        await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`)
            .then(({ data }) => {
                saveMongo(data.id, data);
                info = data
            })
            .catch((err) => {
                console.error(err.response)
                return res.sendStatus(err.response.status)
            })
    }
    res.send(info)
    console.log("Sent.")
})

app.get('/getAll', async (req, res) => {
    console.log("Sending all... ")
    res.send(await findAllMongo())
    console.log("completed.")
})

app.post('/create', async (req, res) => {
    console.log("Saving... ")
    const { id, ...info } = req.body;
    saveMongo(id, info);
    res.send(info)
    console.log("completed.")
})

app.put('/update/:id', async (req, res) => {
    id = parseInt(req.params.id);
    info = await findMongo(id)

    if (info.length) {
        console.log("Updating... ")
        updateMongo(id, req.body)
        res.send()
        console.log("completed.")
    } else {
        console.error("Info is NOT in cache.")
        res.status(400).send()
    }
})

app.delete('/delete/:id', async (req, res) => {
    id = parseInt(req.params.id);
    info = await findMongo(id)

    if (info.length) {
        console.log("Info is in cache... ")
        deleteMongo(id)
        res.send()
        console.log("deleted.")
    } else {
        console.error("Info is NOT in cache.")
        res.send()
    }
})

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`)
})